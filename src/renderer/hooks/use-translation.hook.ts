import { I18nService } from "renderer/services/i18n.service"
import { useService } from "./use-service.hook";

export function useTranslation(): (translationKey: string, args?: Record<string, string>) => string{
   
   const i18nService = useService(I18nService);

   return (key: string, args?: Record<string, string>) => {
      if(!key){ return key; }
      const tranlatables = key.split(" ");
      return tranlatables.map((key) => i18nService.translate(key, args)).join(" ");
   }
}