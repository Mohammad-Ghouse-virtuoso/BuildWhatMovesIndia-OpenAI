"use client";

import { Button } from "@/components/ui/button";
import { card, sectionTitle } from "@/components/ui/styles";

import { saveInformation } from "@/app/(ask)/ask/actions";
import { AiNotice } from "./ai-notice";
import { categoriesByGroup } from "./copy";

interface InformationFormProps {
  id: string;
  selected: string[];
}

export function InformationForm({ id, selected }: InformationFormProps) {
  const groups = categoriesByGroup();

  return (
    <form action={saveInformation} className="space-y-6">
      <input name="id" type="hidden" value={id} />
      <AiNotice />
      {Object.entries(groups).map(([group, categories]) => (
        <fieldset key={group} className="space-y-2">
          <legend className={sectionTitle}>{group}</legend>
          {categories.map((category) => (
            <label
              key={category.id}
              className={"flex items-start gap-3 text-sm " + card}
            >
              <input
                className="mt-1 h-4 w-4 accent-civic-700"
                defaultChecked={selected.includes(category.id)}
                name="category"
                type="checkbox"
                value={category.id}
              />
              <span className="text-ink">{category.label}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <Button className="w-full sm:w-auto" type="submit">
        Build my RTI
      </Button>
    </form>
  );
}
