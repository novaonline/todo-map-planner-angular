export class Logger {
  /**
   *
   *
   * @static
   * @param {*} message
   * @memberof Logger
   */
  public static info(message: any) : void {
    console.log(message);
  }

  /**
   *
   *
   * @static
   * @param {*} message
   * @memberof Logger
   */
  public static error(message: any): void {
    console.error(message);
  }
  /**
   *
   *
   * @static
   * @param {*} message
   * @memberof Logger
   */
  public static warning(message: any): void {
    console.warn(message)
  }
}
