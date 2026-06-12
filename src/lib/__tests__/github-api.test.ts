import { githubApi } from "@/lib/github-api"

describe("githubApi", () => {
  it("has the correct base URL", () => {
    expect(githubApi.defaults.baseURL).toBe("https://api.github.com")
  })

  it("has the correct accept header", () => {
    expect(githubApi.defaults.headers.Accept).toBe(
      "application/vnd.github.v3+json"
    )
  })
})
