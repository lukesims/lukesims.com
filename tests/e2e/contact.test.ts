import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";

type FieldGroup = {
  error: Locator;
  input: Locator;
  label: Locator;
};

class ContactPage {
  form: Locator;
  numApiRequests: number;
  page: Page;
  submitBtn: Locator;
  successMsg: Locator;

  fields: {
    captcha: FieldGroup;
    email: FieldGroup;
    message: FieldGroup;
    name: FieldGroup;
    phone: FieldGroup;
  };

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator("main form");
    this.submitBtn = page.getByRole("button", { name: "Send" });
    this.successMsg = page.locator(`[role="alert"][class*="success"]`);

    const captcha = {} as FieldGroup;
    captcha.label = page.getByText("Are you human?*");
    captcha.input = page.locator("main input[name=captcha_token]");
    captcha.error = captcha.label.locator("..").locator(">span");

    const email = {} as FieldGroup;
    email.label = page.getByText("Email address*");
    email.input = page.getByRole("textbox", { name: "Email address*" });
    email.error = email.label.locator("..").locator(">span");

    const message = {} as FieldGroup;
    message.label = page.getByText("Message*");
    message.input = page.getByRole("textbox", { name: "Message*" });
    message.error = message.label.locator("..").locator(">span");

    const name = {} as FieldGroup;
    name.label = page.getByText("Name*");
    name.input = page.getByRole("textbox", { name: "Name*" });
    name.error = name.label.locator("..").locator(">span");

    const phone = {} as FieldGroup;
    phone.label = page.getByText("Phone number");
    phone.input = page.getByRole("textbox", { name: "Phone number" });
    phone.error = phone.label.locator("..").locator(">span");

    this.fields = { captcha, email, message, name, phone };

    this.numApiRequests = 0;
    page.on("request", (request) => {
      if (request.url().includes("/contact/send")) {
        this.numApiRequests++;
      }
    });
  }

  async expectFieldIsInvalid(
    name: keyof typeof this.fields,
    errorMsg: string | RegExp,
  ) {
    const { error, input, label } = this.fields[name];
    await expect(input).toHaveAttribute("data-invalid", "true");
    await expect(label).toHaveAttribute("data-invalid", "true");
    await expect(error).toBeVisible();
    await expect(error).toHaveText(errorMsg);
  }

  async expectFieldIsValid(name: keyof typeof this.fields) {
    const { error, input, label } = this.fields[name];
    await expect(input).not.toHaveAttribute("data-invalid");
    await expect(label).not.toHaveAttribute("data-invalid");
    await expect(error).not.toBeVisible();
  }

  async expectTurnstileDone() {
    await expect(this.fields.captcha.input).toHaveValue(/.+/, {
      timeout: 10_000,
    });
  }

  async goto() {
    await this.page.goto("/contact");
  }

  waitForApiResponse() {
    return this.page.waitForResponse((response) =>
      response.url().includes("/contact/send"),
    );
  }
}

const test = base.extend<{ contactPage: ContactPage }>({
  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    await use(contactPage);
  },
});

test.describe("Contact Page", () => {
  test("renders successfully", async ({ contactPage }) => {
    await expect(contactPage.page).toHaveTitle(/Contact me/);
    await expect(contactPage.fields.email.error).not.toBeVisible();
    await expect(contactPage.fields.email.input).toBeVisible();
    await expect(contactPage.fields.email.label).toBeVisible();
    await expect(contactPage.fields.message.error).not.toBeVisible();
    await expect(contactPage.fields.message.input).toBeVisible();
    await expect(contactPage.fields.message.label).toBeVisible();
    await expect(contactPage.fields.name.error).not.toBeVisible();
    await expect(contactPage.fields.name.input).toBeVisible();
    await expect(contactPage.fields.name.label).toBeVisible();
    await expect(contactPage.fields.phone.error).not.toBeVisible();
    await expect(contactPage.fields.phone.input).toBeVisible();
    await expect(contactPage.fields.phone.label).toBeVisible();
    await expect(contactPage.fields.captcha.input).not.toBeVisible();
    await expect(contactPage.successMsg).not.toBeVisible();
    await expect(contactPage.submitBtn).toBeVisible();
  });

  test("disables form controls during submission", async ({
    contactPage,
    page,
  }) => {
    await page.route("/contact/send", (route) => {
      setTimeout(() => route.continue(), 500);
    });

    const responsePromise = contactPage.waitForApiResponse();
    await contactPage.fields.name.input.fill("J. Doe");
    await contactPage.fields.phone.input.fill("0123456789");
    await contactPage.fields.email.input.fill("doe@example.com");
    await contactPage.fields.message.input.fill("Lorem ipsum dolor sit amet.");
    await contactPage.expectTurnstileDone();
    await contactPage.submitBtn.click();

    await expect(contactPage.fields.name.input).toBeDisabled();
    await expect(contactPage.fields.phone.input).toBeDisabled();
    await expect(contactPage.fields.email.input).toBeDisabled();
    await expect(contactPage.fields.message.input).toBeDisabled();
    await expect(contactPage.submitBtn).toBeDisabled();

    const response = await responsePromise;
    expect(contactPage.numApiRequests).toBe(1);
    expect(response.status()).toBe(200);

    await expect(contactPage.fields.name.input).not.toBeDisabled();
    await expect(contactPage.fields.phone.input).not.toBeDisabled();
    await expect(contactPage.fields.email.input).not.toBeDisabled();
    await expect(contactPage.fields.message.input).not.toBeDisabled();
    await expect(contactPage.submitBtn).not.toBeDisabled();
  });

  test("submits valid data to the backend", async ({ contactPage }) => {
    const data = {
      name: "John Doe",
      email: "test@example.com",
      message: "Lorem ipsum dolor sit amet.",
    };

    // Fill out all required fields and submit the form
    const responsePromise = contactPage.waitForApiResponse();
    await contactPage.fields.name.input.fill(data.name);
    await contactPage.fields.email.input.fill(data.email);
    await contactPage.fields.message.input.fill(data.message);
    await contactPage.expectTurnstileDone();
    await contactPage.submitBtn.click();

    // Form data should have been submitted to the backend
    const response = await responsePromise;
    expect(contactPage.numApiRequests).toBe(1);
    expect(response.status()).toBe(200);
  });

  test("validates form data", async ({ contactPage }) => {
    // Submit the form without having filled out any of the fields
    await contactPage.expectTurnstileDone();
    await contactPage.submitBtn.click();

    expect(contactPage.numApiRequests).toBe(0);
    await contactPage.expectFieldIsInvalid("name", /enter your name/);
    await contactPage.expectFieldIsInvalid("email", /enter your email address/);
    await contactPage.expectFieldIsInvalid("message", /enter a message/);
    await contactPage.expectFieldIsValid("phone");

    // Fill out the form with invalid data and re-submit
    await contactPage.fields.email.input.fill("notanemailaddress");
    await contactPage.fields.message.input.fill("tooshort");
    await contactPage.submitBtn.click();

    expect(contactPage.numApiRequests).toBe(0);
    await contactPage.expectFieldIsInvalid("name", /enter your name/);
    await contactPage.expectFieldIsInvalid("email", /enter a valid email/);
    await contactPage.expectFieldIsInvalid("message", /enter a longer message/);
    await contactPage.expectFieldIsValid("phone");

    // Correct the validation errors and re-submit
    const responsePromise = contactPage.waitForApiResponse();
    await contactPage.fields.name.input.fill("J. Doe");
    await contactPage.fields.phone.input.fill("0123456789");
    await contactPage.fields.email.input.fill("doe@example.com");
    await contactPage.fields.message.input.fill("Lorem ipsum dolor sit amet.");
    await contactPage.submitBtn.click();

    const response = await responsePromise;
    expect(contactPage.numApiRequests).toBe(1);
    expect(response.status()).toBe(200);
  });

  test("preserves form data on failed submission", async ({ contactPage }) => {
    await contactPage.fields.name.input.fill("J. Doe");
    await contactPage.fields.phone.input.fill("0123456789");
    await contactPage.fields.email.input.fill("notanemail");
    await contactPage.fields.message.input.fill("Lorem ipsum dolor sit amet.");
    await contactPage.submitBtn.click();

    await expect(contactPage.fields.name.input).toHaveValue("J. Doe");
    await expect(contactPage.fields.phone.input).toHaveValue("0123456789");
    await expect(contactPage.fields.email.input).toHaveValue("notanemail");
    await expect(contactPage.fields.message.input).toHaveValue(
      "Lorem ipsum dolor sit amet.",
    );
  });

  test("resets form on successful submission", async ({ contactPage }) => {
    const responsePromise = contactPage.waitForApiResponse();
    await contactPage.fields.name.input.fill("J. Doe");
    await contactPage.fields.phone.input.fill("0123456789");
    await contactPage.fields.email.input.fill("doe@example.com");
    await contactPage.fields.message.input.fill("Lorem ipsum dolor sit amet.");
    await contactPage.expectTurnstileDone();
    await contactPage.submitBtn.click();

    const response = await responsePromise;
    expect(contactPage.numApiRequests).toBe(1);
    expect(response.status()).toBe(200);
    await expect(contactPage.fields.name.input).toHaveValue("");
    await expect(contactPage.fields.phone.input).toHaveValue("");
    await expect(contactPage.fields.email.input).toHaveValue("");
    await expect(contactPage.fields.message.input).toHaveValue("");
  });

  test("displays message on successful submission", async ({ contactPage }) => {
    const responsePromise = contactPage.waitForApiResponse();
    await contactPage.fields.name.input.fill("J. Doe");
    await contactPage.fields.phone.input.fill("0123456789");
    await contactPage.fields.email.input.fill("doe@example.com");
    await contactPage.fields.message.input.fill("Lorem ipsum dolor sit amet.");
    await contactPage.expectTurnstileDone();
    await contactPage.submitBtn.click();

    const response = await responsePromise;
    expect(contactPage.numApiRequests).toBe(1);
    expect(response.status()).toBe(200);
    await expect(contactPage.successMsg).toBeVisible();
    await expect(contactPage.successMsg).toHaveText(/Sent!/);
  });
});
