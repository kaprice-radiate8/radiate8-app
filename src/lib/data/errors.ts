/**
 * SAVE ERRORS
 *
 * When something cannot be saved (the phone is out of space, the browser
 * is in a private mode that blocks saving, or later, the network is down),
 * the store throws a SaveError. Screens catch it and gently tell the person,
 * instead of pretending it worked.
 */
export class SaveError extends Error {
  constructor(cause?: unknown) {
    super("Could not save on this device.");
    this.name = "SaveError";
    this.cause = cause;
  }
}

/**
 * Thrown when saved data couldn't be loaded (for example, no connection to
 * her account). Screens keep showing what they had, and a gentle notice says why.
 */
export class LoadError extends Error {
  constructor(cause?: unknown) {
    super("Could not reach your account.");
    this.name = "LoadError";
    this.cause = cause;
  }
}
