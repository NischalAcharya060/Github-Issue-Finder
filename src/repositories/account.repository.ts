import { prisma } from "@/lib/prisma"

export class AccountRepository {
  /**
   * Retrieves the decrypted GitHub access token for a given user ID.
   */
  static async getGithubTokenByUserId(userId: string): Promise<string | null> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          provider: "github",
        },
        select: {
          access_token: true,
        },
      })
      return account?.access_token ?? null
    } catch (error) {
      console.error(`Error in AccountRepository.getGithubTokenByUserId for userId ${userId}:`, error)
      return null
    }
  }
}
