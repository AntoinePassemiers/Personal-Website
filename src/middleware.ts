import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(
  ({ url, cookies, locals }, next) => {
    const match =
      url.pathname.match(
        /\/(en|fr)\/?$/,
      );

    const pathLocale =
      match?.[1] === 'fr'
        ? 'fr'
        : match?.[1] === 'en'
          ? 'en'
          : null;

    const cookieLocale =
      cookies.get('locale')?.value;

    locals.locale =
      pathLocale ??
      (cookieLocale === 'fr'
        ? 'fr'
        : 'en');

    return next();
  },
);
