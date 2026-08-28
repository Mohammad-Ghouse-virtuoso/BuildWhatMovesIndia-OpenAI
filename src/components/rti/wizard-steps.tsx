import { WIZARD_STEPS } from "./copy";

interface WizardStepsProps {
  current: (typeof WIZARD_STEPS)[number]["label"];
}

export function WizardSteps({ current }: WizardStepsProps) {
  return (
    <ol className="mb-6 flex gap-2 overflow-x-auto pb-2 text-xs font-semibold text-ink-muted [-webkit-overflow-scrolling:touch]">
      {WIZARD_STEPS.map((step, index) => {
        const active = step.label === current;
        return (
          <li
            key={step.href}
            className={
              active
                ? "shrink-0 whitespace-nowrap rounded-full bg-civic-700 px-3 py-1 text-white"
                : "shrink-0 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1"
            }
          >
            {index + 1}. {step.label}
          </li>
        );
      })}
    </ol>
  );
}
