import { FluentBundle, FluentResource } from "@fluent/bundle";

import en from "./en.ftl?raw";
import fr from "./fr.ftl?raw";


const resources = {
  en,
  fr,
};


export function getTranslator(locale: "en" | "fr") {
  const bundle = new FluentBundle(locale);

  bundle.addResource(
    new FluentResource(resources[locale])
  );

  return (id: string, args?: Record<string, unknown>) => {
    const message = bundle.getMessage(id);

    if (!message?.value) {
      return id;
    }

    return bundle.formatPattern(message.value, args);
  };
}
