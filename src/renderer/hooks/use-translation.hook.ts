import { I18nService } from "renderer/services/i18n.service"
import { useService } from "./use-service.hook";
import { useObservable } from "./use-observable.hook";
import { distinctUntilChanged } from "rxjs";

export function useTranslation(): (translationKey: string, args?: Record<string, string>) => string{
   
   const i18nService = useService(I18nService);

   // Re translate when language changes
   useObservable(i18nService.currentLanguage$.pipe(distinctUntilChanged()));

   return (key: string, args?: Record<string, string>) => {
      if(!key){ return key; }
      const tranlatables = key.split(" ");
      return tranlatables.map((key) => i18nService.translate(key, args)).join(" ");
   }
}