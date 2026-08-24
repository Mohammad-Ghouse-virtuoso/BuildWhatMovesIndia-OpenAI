import { WIZARD_STEPS } from "./copy";

interface WizardStepsProps {
  current: (typeof WIZARD_STEPS)[number]["label"];
}

export function WizardSteps({ current }: WizardStepsProps) {
  return (
    <ol className="mb-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
      {WIZARD_STEPS.map((step, index) => {
        const active = step.label === current;
        return (
          <li
            key={step.href}
            className={
              active
                ? "rounded-full bg-civic-900 px-3 py-1 text-white"
                : "rounded-full bg-civic-50 px-3 py-1"
            }
          >
            {index + 1}. {step.label}
          </li>
        );
      })}
    </ol>
  );
}
