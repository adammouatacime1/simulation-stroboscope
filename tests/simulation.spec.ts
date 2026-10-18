import { expect, test } from "@playwright/test";

test("le scénario inverse progresse éclair par éclair et se réinitialise", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un disque. Des éclairs.",
  );
  await expect(page.getByTestId("minimal-step")).toHaveText("−36°");
  await expect(page.getByTestId("flash-count")).toHaveText("1");
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("1,9 s");
  await expect(page.getByTestId("real-angle")).toHaveText("324°");
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  await expect(page.getByTestId("flash-count")).toHaveText("2");
  await expect(
    page.getByTestId("sample-timeline").locator(".sample"),
  ).toHaveCount(2);
  await expect(page.getByTestId("apparent-arc")).toHaveAttribute(
    "d",
    /A86,86 0 0 1 /,
  );
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("apparent-angle")).toHaveText("288°");
  await page.getByRole("checkbox", { name: "Traces" }).uncheck();
  await expect(page.getByTestId("apparent-arc")).toHaveCount(0);
  await page.getByRole("button", { name: "Réinitialiser" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("0 s");
  await expect(page.getByTestId("apparent-angle")).toHaveText("0°");
  expect(errors).toEqual([]);
});

test("la rotation réelle avance, la position échantillonnée reste fixe entre les éclairs, la pause est stable", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Démarrer" }).click();
  await page.clock.runFor(520);
  await expect(page.getByTestId("real-angle")).not.toHaveText("0°");
  await expect(page.getByTestId("apparent-angle")).toHaveText("0°");
  await page.clock.runFor(1500);
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  await page.getByRole("button", { name: "Arrêter", exact: true }).click();
  const paused = await page.getByTestId("elapsed").textContent();
  await page.clock.runFor(1000);
  await expect(page.getByTestId("elapsed")).toHaveText(paused!);
  await page.getByRole("button", { name: "Reprendre" }).click();
  await page.clock.runFor(400);
  await expect(page.getByTestId("elapsed")).not.toHaveText(paused!);
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("3,8 s");
  await expect(page.getByRole("button", { name: "Reprendre" })).toBeVisible();
});

test("les périodes sont indépendantes, les cas limites explicites, les entrées invalides sans effet", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("spinbutton", { name: "Période de rotation" }).fill("2");
  await expect(
    page.getByRole("spinbutton", { name: "Période des éclairs" }),
  ).toHaveValue("1.9");
  await expect(page.getByTestId("minimal-step")).toHaveText("−18°");
  await page.getByRole("spinbutton", { name: "Période des éclairs" }).fill("0");
  await expect(
    page.getByRole("spinbutton", { name: "Période des éclairs" }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("minimal-step")).toHaveText("−18°");
  await page.getByRole("button", { name: "Immobilité", exact: true }).click();
  await expect(page.getByTestId("minimal-step")).toHaveText("0°");
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("apparent-angle")).toHaveText("0°");
  await page.getByRole("button", { name: "Cas ambigu", exact: true }).click();
  await expect(page.getByTestId("minimal-step")).toHaveText("±180°");
  await expect(page.getByTestId("explanation")).toContainText(
    "ne permettent pas de choisir un sens",
  );
  await expect(page.getByTestId("elapsed")).toHaveText("0 s");
  await page.getByRole("button", { name: "Sens direct", exact: true }).click();
  await expect(page.getByTestId("minimal-step")).toHaveText("+36°");
});

test("l’interface reste utilisable sur téléphone, sans débordement de la page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (let index = 0; index < 10; index++)
    await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(
    page.getByTestId("sample-timeline").locator(".sample"),
  ).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("les petites périodes restent lisibles et exactes jusqu’à une milliseconde", async ({ page }) => {
  await page.goto("/");
  const rotation = page.getByRole("spinbutton", { name: "Période de rotation" });
  const flashes = page.getByRole("spinbutton", { name: "Période des éclairs" });
  await rotation.fill("0.01");
  await flashes.fill("0.019");
  await expect(rotation).toHaveAttribute("aria-invalid", "false");
  await expect(flashes).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("minimal-step")).toHaveText("−36°");
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("0,019 s");
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  await expect(page.getByTestId("sample-timeline")).toContainText("0,019 s");

  // Home selects the lower bound through the actual slider control.
  await page.getByRole("slider", { name: "Régler période des éclairs" }).focus();
  await page.keyboard.press("Home");
  await expect(flashes).toHaveValue("0.001");
  await expect(rotation).toHaveValue("0.01");
  await expect(page.getByTestId("elapsed")).toHaveText("0 s");
  await page.getByRole("button", { name: "Avancer d’un éclair" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("0,001 s");
  await expect(page.getByTestId("apparent-angle")).toHaveText("36°");
  await flashes.fill("0.0005");
  await expect(flashes).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("minimal-step")).toHaveText("+36°");
});
