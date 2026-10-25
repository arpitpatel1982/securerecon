import { Technology } from "@shared/schema";

export function detectTechnologies(
  headers: Record<string, string | string[] | undefined>,
  html: string
): Technology[] {
  const technologies: Technology[] = [];
  const headerStr = JSON.stringify(headers).toLowerCase();
  const htmlLower = html.toLowerCase();

  // Server detection
  const serverHeader = headers["server"];
  const serverValue = Array.isArray(serverHeader) ? serverHeader[0] : serverHeader;
  
  if (serverValue) {
    if (serverValue.includes("nginx")) {
      const versionMatch = serverValue.match(/nginx\/([\d.]+)/i);
      technologies.push({
        name: "Nginx",
        category: "Web Server",
        version: versionMatch?.[1],
        confidence: 100,
        hasKnownVulnerabilities: false,
      });
    } else if (serverValue.includes("apache")) {
      const versionMatch = serverValue.match(/apache\/([\d.]+)/i);
      technologies.push({
        name: "Apache",
        category: "Web Server",
        version: versionMatch?.[1],
        confidence: 100,
        hasKnownVulnerabilities: false,
      });
    } else if (serverValue.includes("cloudflare")) {
      technologies.push({
        name: "Cloudflare",
        category: "CDN",
        confidence: 100,
        hasKnownVulnerabilities: false,
      });
    }
  }

  // Framework detection from headers
  if (headers["x-powered-by"]) {
    const poweredBy = Array.isArray(headers["x-powered-by"]) 
      ? headers["x-powered-by"][0] 
      : headers["x-powered-by"];
    
    if (poweredBy.includes("Express")) {
      technologies.push({
        name: "Express.js",
        category: "Web Framework",
        confidence: 100,
        hasKnownVulnerabilities: false,
      });
    } else if (poweredBy.includes("PHP")) {
      const versionMatch = poweredBy.match(/PHP\/([\d.]+)/i);
      technologies.push({
        name: "PHP",
        category: "Programming Language",
        version: versionMatch?.[1],
        confidence: 100,
        hasKnownVulnerabilities: false,
      });
    }
  }

  // Frontend frameworks from HTML
  if (htmlLower.includes("react")) {
    technologies.push({
      name: "React",
      category: "JavaScript Framework",
      confidence: 85,
      hasKnownVulnerabilities: false,
    });
  }

  if (htmlLower.includes("vue") || htmlLower.includes("v-if") || htmlLower.includes("v-for")) {
    technologies.push({
      name: "Vue.js",
      category: "JavaScript Framework",
      confidence: 85,
      hasKnownVulnerabilities: false,
    });
  }

  if (htmlLower.includes("angular") || htmlLower.includes("ng-app")) {
    technologies.push({
      name: "Angular",
      category: "JavaScript Framework",
      confidence: 85,
      hasKnownVulnerabilities: false,
    });
  }

  if (htmlLower.includes("jquery")) {
    const versionMatch = html.match(/jquery[/-]([\d.]+)/i);
    technologies.push({
      name: "jQuery",
      category: "JavaScript Library",
      version: versionMatch?.[1],
      confidence: 90,
      hasKnownVulnerabilities: false,
    });
  }

  // CMS detection
  if (htmlLower.includes("wp-content") || htmlLower.includes("wordpress")) {
    technologies.push({
      name: "WordPress",
      category: "CMS",
      confidence: 95,
      hasKnownVulnerabilities: true,
    });
  }

  if (htmlLower.includes("drupal")) {
    technologies.push({
      name: "Drupal",
      category: "CMS",
      confidence: 90,
      hasKnownVulnerabilities: false,
    });
  }

  // Analytics
  if (htmlLower.includes("google-analytics") || htmlLower.includes("gtag")) {
    technologies.push({
      name: "Google Analytics",
      category: "Analytics",
      confidence: 100,
      hasKnownVulnerabilities: false,
    });
  }

  // CSS Frameworks
  if (htmlLower.includes("bootstrap")) {
    const versionMatch = html.match(/bootstrap[/-]([\d.]+)/i);
    technologies.push({
      name: "Bootstrap",
      category: "CSS Framework",
      version: versionMatch?.[1],
      confidence: 95,
      hasKnownVulnerabilities: false,
    });
  }

  if (htmlLower.includes("tailwind")) {
    technologies.push({
      name: "Tailwind CSS",
      category: "CSS Framework",
      confidence: 85,
      hasKnownVulnerabilities: false,
    });
  }

  return technologies;
}
