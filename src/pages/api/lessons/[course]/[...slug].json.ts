import type { APIRoute, GetStaticPaths } from 'astro';
import { fullLessonPayload, jsonResponse } from '../../../../lib/api-data';
import { getLessonContexts, type LessonContext } from '../../../../lib/course-data';

export const getStaticPaths: GetStaticPaths = async () => {
  const contexts = await getLessonContexts();

  return contexts.map(context => {
    const [course, ...slugParts] = context.lesson.id.split('/');

    return {
      params: { course, slug: slugParts.join('/') },
      props: { context },
    };
  });
};

export const GET: APIRoute<{ context: LessonContext }> = async ({ props, site }) => {
  return jsonResponse(await fullLessonPayload(props.context, site));
};
