/** Real cover photo for a course. Uses the uploaded cover_image if the instructor
 * set one, otherwise a deterministic photo from Picsum (same course → same photo,
 * every time) so cards never show a flat placeholder block. */
export function getCourseCoverUrl(course: { slug: string; cover_image?: string | null }, width = 800, height = 450) {
  if (course.cover_image) return course.cover_image
  return `https://picsum.photos/seed/${encodeURIComponent(course.slug)}/${width}/${height}`
}
