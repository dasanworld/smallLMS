import { Hono } from "hono";
import { errorBoundary } from "@/backend/middleware/error";
import { withAppContext } from "@/backend/middleware/context";
import { withSupabase } from "@/backend/middleware/supabase";
import { registerExampleRoutes } from "@/features/example/backend/route";
import { registerOnboardingRoutes } from "@/features/auth/backend/onboarding/route";
import { registerRoleRoutes } from "@/features/auth/backend/role-route";
import { registerCoursesRoutes } from "@/features/courses/backend/route";
import { registerAssignmentsRoutes } from "@/features/assignments/backend/route";
import { registerSubmissionsRoutes } from "@/features/submissions/backend/route";
import { registerLearnerAssignmentsRoutes } from "@/features/learner-assignments/backend/route";
import { registerLearnerSubmissionsRoutes } from "@/features/learner-submissions/backend/route";
import { registerEnrollmentsRoutes } from "@/features/enrollments/backend/route";
import { registerDashboardRoutes } from "@/features/dashboard/backend/route";
import { registerGradesRoutes } from "@/features/grades/backend/route";
import { registerInstructorDashboardRoutes } from "@/features/instructor-dashboard/backend/route";
import { registerAdminRoutes } from "@/features/admin/backend/route";
import type { AppEnv } from "@/backend/hono/context";

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp && process.env.NODE_ENV === "production") {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use("*", errorBoundary());
  app.use("*", withAppContext());
  app.use("*", withSupabase());

  registerOnboardingRoutes(app);
  registerRoleRoutes(app);
  registerCoursesRoutes(app);
  registerAssignmentsRoutes(app);
  registerSubmissionsRoutes(app);
  registerLearnerAssignmentsRoutes(app);
  registerLearnerSubmissionsRoutes(app);
  registerEnrollmentsRoutes(app);
  registerDashboardRoutes(app);
  registerGradesRoutes(app);
  registerInstructorDashboardRoutes(app);
  registerAdminRoutes(app);
  registerExampleRoutes(app);

  app.notFound((c) => {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: `Route not found: ${c.req.method} ${c.req.path}`,
        },
      },
      404
    );
  });

  if (process.env.NODE_ENV === "production") {
    singletonApp = app;
  }

  return app;
};
