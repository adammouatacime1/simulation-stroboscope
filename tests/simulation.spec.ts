import { expect, test } from "@playwright/test";

test("le scénario inverse progresse éclair par éclair et se réinitialise", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Explorez le mouvement.",
  );
  await expect(page.getByTestId("minimal-step")).toHaveText("−36°");
  await expect(page.getByTestId("flash-count")).toHaveText("1");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("1,9 s");
  await expect(page.getByTestId("real-angle")).toHaveText("324°");
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  await expect(page.getByTestId("flash-count")).toHaveText("2");
  await expect(
    page.getByTestId("sample-timeline").locator(".sample"),
  ).toHaveCount(2);
  await expect(page.getByTestId("apparent-arc")).toHaveAttribute(
    "d",
    /A88,88 0 0 1 /,
  );
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("apparent-angle")).toHaveText("288°");
  await page.getByRole("checkbox", { name: "Positions successives" }).uncheck();
  await expect(page.getByTestId("apparent-arc")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Réinitialiser", exact: true })
    .click();
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
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await page.getByTestId("elapsed").textContent();
  await page.clock.runFor(1000);
  await expect(page.getByTestId("elapsed")).toHaveText(paused!);
  await page.getByRole("button", { name: "Reprendre" }).click();
  await page.clock.runFor(400);
  await expect(page.getByTestId("elapsed")).not.toHaveText(paused!);
  await page.getByRole("button", { name: "Éclair suivant" }).click();
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
  await page.getByRole("button", { name: "Immobilité" }).click();
  await expect(page.getByTestId("minimal-step")).toHaveText("0°");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("apparent-angle")).toHaveText("0°");
  await page.getByRole("button", { name: "Cas ambigu" }).click();
  await expect(page.getByTestId("minimal-step")).toHaveText("±180°");
  await expect(page.getByTestId("explanation")).toContainText(
    "ne permettent pas de choisir un sens",
  );
  await expect(page.getByTestId("elapsed")).toHaveText("0 s");
  await page.getByRole("button", { name: "Sens direct" }).click();
  await expect(page.getByTestId("minimal-step")).toHaveText("+36°");
});

test("l’interface reste utilisable sur téléphone, sans débordement de la page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (let index = 0; index < 10; index++)
    await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(
    page.getByTestId("sample-timeline").locator(".sample"),
  ).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("les petites périodes restent lisibles et exactes jusqu’à une milliseconde", async ({
  page,
}) => {
  await page.goto("/");
  const rotation = page.getByRole("spinbutton", {
    name: "Période de rotation",
  });
  const flashes = page.getByRole("spinbutton", { name: "Période des éclairs" });
  await rotation.fill("0.01");
  await flashes.fill("0.019");
  await expect(rotation).toHaveAttribute("aria-invalid", "false");
  await expect(flashes).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByTestId("minimal-step")).toHaveText("−36°");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("0,019 s");
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  await expect(page.getByTestId("sample-timeline")).toContainText("0,019 s");

  // Home selects the lower bound through the actual slider control.
  await page
    .getByRole("slider", { name: "Régler période des éclairs" })
    .focus();
  await page.keyboard.press("Home");
  await expect(flashes).toHaveValue("0.001");
  await expect(rotation).toHaveValue("0.01");
  await expect(page.getByTestId("elapsed")).toHaveText("0 s");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("0,001 s");
  await expect(page.getByTestId("apparent-angle")).toHaveText("36°");
  await flashes.fill("0.0005");
  await expect(flashes).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("minimal-step")).toHaveText("+36°");
});

test("les expériences rapides conservent les valeurs et les trois interprétations physiques", async ({
  page,
}) => {
  await page.goto("/");
  for (const scenario of [
    {
      name: "Rotation inverse",
      te: "0.095",
      delta: "−36°",
      direction: "Inverse",
      angle: "324°",
    },
    {
      name: "Sens direct",
      te: "0.055",
      delta: "+36°",
      direction: "Direct",
      angle: "36°",
    },
    {
      name: "Immobilité",
      te: "0.1",
      delta: "0°",
      direction: "Stationnaire",
      angle: "0°",
    },
  ]) {
    const preset = page.getByRole("button", { name: scenario.name });
    await preset.click();
    await expect(preset).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("spinbutton", { name: "Période de rotation" }),
    ).toHaveValue("0.05");
    await expect(
      page.getByRole("spinbutton", { name: "Période des éclairs" }),
    ).toHaveValue(scenario.te);
    await expect(page.getByTestId("real-frequency")).toHaveText("20Hz");
    await expect(page.getByTestId("minimal-step")).toHaveText(scenario.delta);
    await expect(page.getByTestId("apparent-direction")).toHaveText(
      scenario.direction,
    );
    await page.getByRole("button", { name: "Éclair suivant" }).click();
    await expect(page.getByTestId("apparent-angle")).toHaveText(scenario.angle);
  }
  await page.getByRole("button", { name: "Configuration libre" }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Période de rotation" }),
  ).toBeFocused();
});

test("les thèmes persistent et l’aide reste utilisable au clavier", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Activer le mode sombre" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Aide", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("684°");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Aide", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Activer le mode clair" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("le ralenti ne change ni les périodes ni les observations, et la rémanence est facultative", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page
    .getByRole("combobox", { name: "Vitesse de simulation" })
    .selectOption("0.5");
  await page
    .getByRole("checkbox", { name: "Rémanence", exact: true })
    .uncheck();
  await page.getByRole("button", { name: "Démarrer" }).click();
  await page.clock.runFor(1016);
  const time = Number(
    (await page.getByTestId("elapsed").innerText())
      .replace(" s", "")
      .replace(",", "."),
  );
  expect(time).toBeGreaterThan(0.45);
  expect(time).toBeLessThan(0.55);
  await expect(page.getByTestId("observed-point")).toHaveCount(0);
  await expect(page.getByTestId("apparent-angle")).toHaveText("0°");
  await expect(
    page.getByRole("spinbutton", { name: "Période de rotation" }),
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("elapsed")).toHaveText("1,9 s");
  await expect(page.getByTestId("observed-point")).toHaveCount(1);
  await expect(page.getByTestId("apparent-angle")).toHaveText("324°");
  await page
    .getByRole("button", { name: "Réinitialiser toute l’expérience" })
    .click();
  await expect(page.getByTestId("elapsed")).toHaveText("0 s");
  await expect(
    page.getByRole("checkbox", { name: "Rémanence", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("combobox", { name: "Vitesse de simulation" }),
  ).toHaveValue("1");
});

test("le graphique distingue courbe réelle et convention apparente, y compris les limites de densité", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await expect(page.getByTestId("real-curve-segment")).toHaveCount(12);
  await expect(page.getByTestId("alias-curve-segment")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Éclair 0, temps 0 secondes, angle 0 degrés" })
    .focus();
  await expect(page.getByTestId("chart-tooltip")).toContainText("Éclair 0");
  await page
    .getByRole("checkbox", { name: "Trajet apparent minimal" })
    .uncheck();
  await expect(page.getByTestId("alias-curve-segment")).toHaveCount(0);
  await page.getByRole("button", { name: "Cas ambigu" }).click();
  await page.getByRole("button", { name: "Éclair suivant" }).click();
  await page.getByRole("checkbox", { name: "Trajet apparent minimal" }).check();
  await expect(page.getByTestId("alias-curve-segment")).toHaveCount(0);
  await expect(page.getByTestId("apparent-direction")).toHaveText(
    "Indéterminé",
  );
  await page
    .getByRole("spinbutton", { name: "Période de rotation" })
    .fill("0.001");
  await page
    .getByRole("spinbutton", { name: "Période des éclairs" })
    .fill("10");
  await expect(page.getByRole("status")).toContainText("Trop de tours");
  await expect(page.getByTestId("real-curve-segment")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Fenêtre du graphique" })
    .selectOption("turns");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByTestId("real-curve-segment")).toHaveCount(2);
});
