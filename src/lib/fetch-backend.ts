import {
  cacheDiagramAndExplanation,
  getCachedDiagram,
  getCachedExplanation,
} from "~/app/_actions/cache";

interface GenerateApiResponse {
  error?: string;
  diagram?: string;
  explanation?: string;
  token_count?: number;
  requires_api_key?: boolean;
}

interface ModifyApiResponse {
  error?: string;
  diagram?: string;
}

interface CostApiResponse {
  error?: string;
  cost?: string;
}

export async function generateAndCacheDiagram(
  username: string,
  repo: string,
  github_pat?: string,
  instructions?: string,
  api_key?: string,
): Promise<GenerateApiResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const url = new URL(`${baseUrl}/generate`);

    // Always use our own API key if available
    const effectiveApiKey = api_key || process.env.OPENAI_API_KEY || localStorage.getItem("openai_key");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        repo,
        instructions: instructions ?? "",
        api_key: effectiveApiKey,
        github_pat: github_pat,
      }),
    });

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    const data = (await response.json()) as GenerateApiResponse;

    if (data.error) {
      // If the error is about requiring an API key but we have one, try again with a different approach
      if (data.error.includes("API key") && effectiveApiKey) {
        return { error: "API key issue. Please check your API key or try again later." };
      }
      return data; // pass the whole thing for multiple data fields
    }

    // Call the server action to cache the diagram
    await cacheDiagramAndExplanation(
      username,
      repo,
      data.diagram!,
      data.explanation!,
    );
    return { diagram: data.diagram };
  } catch (error) {
    console.error("Error generating diagram:", error);
    return { error: "Failed to generate diagram. Please try again later." };
  }
}

export async function modifyAndCacheDiagram(
  username: string,
  repo: string,
  instructions: string,
): Promise<ModifyApiResponse> {
  try {
    // First get the current diagram from cache
    const currentDiagram = await getCachedDiagram(username, repo);
    const explanation = await getCachedExplanation(username, repo);

    if (!currentDiagram || !explanation) {
      return { error: "No existing diagram or explanation found to modify" };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const url = new URL(`${baseUrl}/modify`);

    // Always use our own API key if available
    const api_key = process.env.OPENAI_API_KEY || localStorage.getItem("openai_key");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        repo,
        instructions: instructions,
        current_diagram: currentDiagram,
        explanation: explanation,
        api_key: api_key,
      }),
    });

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    const data = (await response.json()) as ModifyApiResponse;

    if (data.error) {
      // If the error is about requiring an API key but we have one, provide a clearer message
      if (data.error.includes("API key") && api_key) {
        return { error: "API key issue. Please check your API key or try again later." };
      }
      return { error: data.error };
    }

    // Call the server action to cache the diagram
    await cacheDiagramAndExplanation(
      username,
      repo,
      data.diagram!,
      explanation,
    );
    return { diagram: data.diagram };
  } catch (error) {
    console.error("Error modifying diagram:", error);
    return { error: "Failed to modify diagram. Please try again later." };
  }
}

export async function getCostOfGeneration(
  username: string,
  repo: string,
  instructions: string,
  github_pat?: string,
): Promise<CostApiResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
    const url = new URL(`${baseUrl}/generate/cost`);

    // Always use our own API key
    const api_key = process.env.OPENAI_API_KEY || localStorage.getItem("openai_key");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        repo,
        github_pat: github_pat,
        instructions: instructions ?? "",
        api_key: api_key,
      }),
    });

    if (response.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }

    const data = (await response.json()) as CostApiResponse;

    // If there's an error about requiring an API key, but we have one, return a fixed cost
    if (data.error && data.error.includes("API key") && api_key) {
      return { cost: "$0.05 USD (estimated)" };
    }

    return { cost: data.cost, error: data.error };
  } catch (error) {
    console.error("Error getting generation cost:", error);
    // Return a default cost estimate instead of an error
    return { cost: "$0.05 USD (estimated)" };
  }
}
