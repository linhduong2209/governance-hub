import { TFunction } from "i18next";

type TParam0 = Parameters<TFunction<"translation", undefined>>[0];

export const htmlIn =
  (t: TFunction<"translation", undefined>) =>
  (
    key: TParam0,
    args: Record<string, string | number | null | undefined> = {},
  ) => {
    let value = t(key, { ...args, link: "<<link>>" }) as string;
    if (value.includes("<<link>>")) {
      const linkUrl = t((key + "LinkURL") as TParam0);
      const linkLabel = t((key + "LinkLabel") as TParam0);
      value = value.replace(
        "<<link>>",
        `<a class="font-semibold truncate inline-flex items-center space-x-3 max-w-full rounded cursor-pointer hover:text-primary active:text-primary focus-visible:ring focus:outline-none focus-visible:ring-primary text-primary" href="${linkUrl}" target=”_blank”>${linkLabel}</a>`,
      );
    }
    return value;
  };
