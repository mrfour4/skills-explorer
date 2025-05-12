import { sql } from "@/db/config";
import { searchParamsSchema } from "@/modules/home/schemas/search-params-schema";
import { NextRequest } from "next/server";
import queryString from "query-string";

export async function GET(req: NextRequest) {
    const raw = queryString.parse(req.nextUrl.searchParams.toString(), {
        arrayFormat: "bracket",
    });

    const parsed = searchParamsSchema.safeParse(raw);
    if (!parsed.success) {
        console.error("Invalid query parameters:", parsed.error.flatten());
        return Response.json(
            { error: "Invalid query parameters" },
            { status: 400 },
        );
    }

    console.log("Parsed query parameters:", parsed.data);

    const {
        jobTitle,
        locations,
        levels,
        updatedAfter,
        lastFreq,
        lastName,
        limit = 20,
    } = parsed.data;

    const start = Date.now();

    try {
        const rows = await sql`
      WITH
      params AS (
        SELECT
          ${jobTitle}::text AS raw_input,
          ${locations}::text[] AS filter_location,
          ${levels}::text[] AS filter_seniority,
          ${updatedAfter}::text AS filter_posted_date
      ),
      tokens AS (
        SELECT unnest(string_to_array(unaccent(lower(p.raw_input)), ' ')) AS token
        FROM params p
      ),
      matched_alias AS (
        SELECT ka.job_word
        FROM keyword_alias ka
        JOIN tokens t ON unaccent(lower(ka.keyword)) = t.token
        UNION
        SELECT ka.job_word
        FROM keyword_alias ka, params p
        WHERE unaccent(lower(ka.keyword)) = unaccent(lower(p.raw_input))
      ),
      ranked_job_word AS (
        SELECT job_word, COUNT(*) AS hits
        FROM matched_alias
        GROUP BY job_word
        ORDER BY hits DESC
        LIMIT 1
      ),
      jobs_limited AS (
        SELECT j.*
        FROM jobs j
        JOIN params p ON TRUE
        WHERE 
          (p.filter_location IS NULL OR j.location = ANY(p.filter_location))
          AND (p.filter_seniority IS NULL OR j.seniority_level = ANY(p.filter_seniority))
          AND (
            j.posted_date >= COALESCE(
              TO_DATE(p.filter_posted_date, 'YYYY-MM-DD'),
              CURRENT_DATE - INTERVAL '6 months'
            )
          )
      ),
      fts_jobs AS (
        SELECT j.id
        FROM jobs_limited j
        JOIN ranked_job_word rj ON j.job_title_tsv @@ plainto_tsquery('simple', unaccent(rj.job_word))
      ),
      fts_direct AS (
        SELECT j.id
        FROM jobs_limited j, params p
        WHERE NOT EXISTS (SELECT 1 FROM fts_jobs)
          AND j.job_title_tsv @@ plainto_tsquery('simple', unaccent(p.raw_input))
      ),
      fuzzy_token_jobs AS (
        SELECT j.id
        FROM jobs_limited j, params p
        WHERE NOT EXISTS (
          SELECT 1 FROM fts_jobs
          UNION
          SELECT 1 FROM fts_direct
        )
        AND EXISTS (
          SELECT 1
          FROM unnest(string_to_array(unaccent(lower(j.job_title)), ' ')) AS token
          WHERE similarity(token, p.raw_input) > 0.3
        )
      ),
      matched_jobs AS (
        SELECT id FROM fts_jobs
        UNION
        SELECT id FROM fts_direct
        UNION
        SELECT id FROM fuzzy_token_jobs
      ),
      total_jobs AS (
        SELECT COUNT(*)::float AS total FROM matched_jobs
      ),
      skill_stats AS (
        SELECT
          s.name AS skill_name,
          s.type AS skill_type,
          COUNT(*) AS skill_count
        FROM matched_jobs mj
        JOIN job_skills js ON js.job_id = mj.id
        JOIN skills s ON s.id = js.skill_id
        GROUP BY s.name, s.type
      ),
      skill_freq AS (
        SELECT
          skill_name,
          skill_type,
          skill_count,
          ROUND((skill_count * 100.0 / total_jobs.total)::numeric, 1) AS frequency_percent,
          total_jobs.total AS matched_job_count
        FROM skill_stats, total_jobs
      )
      SELECT
        skill_name,
        skill_type,
        CONCAT(frequency_percent, '%') AS frequency,
        frequency_percent,
        matched_job_count
      FROM skill_freq
      WHERE (
        (${lastFreq}::numeric IS NULL AND ${lastName}::text IS NULL)
        OR (
          frequency_percent < ${lastFreq}::numeric
          OR (frequency_percent = ${lastFreq}::numeric AND skill_name > ${lastName}::text)
        )
      )
      ORDER BY frequency_percent DESC, skill_name
      LIMIT ${limit};
    `;

        const duration = Date.now() - start;

        console.log("cursor:", rows.length === limit);

        const nextCursor =
            rows.length === limit
                ? {
                      lastFreq: parseFloat(
                          rows[rows.length - 1].frequencyPercent,
                      ),
                      lastName: rows[rows.length - 1].skillName,
                  }
                : null;

        return Response.json({
            data: rows.map(
                ({ frequencyPercent, matchedJobCount, ...rest }) => rest,
            ),
            nextCursor,
            meta: {
                count: rows.length,
                matchedJobCount: rows[0]?.matchedJobCount ?? 0,
                duration: duration,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error fetching skills:", error);
        return Response.json(
            { error: "Failed to fetch skills" },
            { status: 500 },
        );
    }
}
