import app from '../../worker';

export const onRequest: PagesFunction = (context) => app.fetch(context.request, context.env);
