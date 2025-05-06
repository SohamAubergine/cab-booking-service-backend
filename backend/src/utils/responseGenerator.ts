export class APIResponse {
  /**
   * Returns a Success API response
   * @param message - Message of the response
   * @param data - Data to be sent in the response (nullable)
   * @param extra - Additional description (nullable)
   */
  static sendSuccess({
    message,
    data = null,
    extra = null,
  }: {
    message: string;
    data?: Record<string, any> | null;
    extra?: Record<string, any> | null;
  }) {
    return { success: true, message, data, extra };
  }

  /**
   * Returns an Error API response
   * @param message - Message of the response
   * @param data - Data to be sent in the response (nullable)
   * @param extra - Additional description (nullable)
   */
  static sendError({
    message,
    data = null,
    extra = null,
  }: {
    message: string;
    data?: Record<string, any> | null;
    extra?: Record<string, any> | null;
  }) {
    return { success: false, message, data, extra };
  }
}
