
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Die Login-Seite muss ohne Anmeldung erreichbar bleiben.
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Antwort vorbereiten, damit Supabase Cookies aktualisieren kann.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          // Aktualisierte Cookies an die Anfrage übergeben.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          // Aktualisierte Cookies auch an den Browser zurückgeben.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers ?? {}).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    }
  );

  // Benutzer beim Supabase-Auth-Server überprüfen.
  const { data, error } = await supabase.auth.getUser();

  const adminId = process.env.ADMIN_USER_ID;

  const isAdmin =
    !error &&
    !!adminId &&
    !!data.user &&
    data.user.id === adminId;

  if (!isAdmin) {
    const redirect = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    // Eventuell aktualisierte Session-Cookies übernehmen.
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });

    return redirect;
  }

  // Nur der freigegebene Administrator darf weiter.
  return response;
}

// Die Prüfung gilt für alle Admin-Unterseiten.
export const config = {
  matcher: ["/admin/:path*"],
};
