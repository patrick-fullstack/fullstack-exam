import { SessionData, Store } from "express-session";
import { Session } from "../models/Session";

export class MongoSessionStore extends Store {
  constructor() {
    super();
  }

  get(
    sessionId: string,
    callback: (err: any, session?: SessionData | null) => void
  ) {
    Session.findById(sessionId)
      .then((sessionDoc) => {
        if (!sessionDoc) {
          return callback(null, null);
        }

        if (sessionDoc.expires < new Date()) {
          Session.findByIdAndDelete(sessionId).catch(console.error);
          return callback(null, null);
        }

        try {
          const sessionData = sessionDoc.data;
          callback(null, sessionData);
        } catch (error) {
          callback(error);
        }
      })
      .catch((err) => {
        console.error("Session get error:", err);
        callback(err);
      });
  }

  set(sessionId: string, session: SessionData, callback?: (err?: any) => void) {
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);

    Session.findByIdAndUpdate(
      sessionId,
      {
        _id: sessionId,
        data: session,
        expires: expires,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    )
      .then(() => callback && callback())
      .catch((err) => {
        console.error("Session set error:", err);
        callback && callback(err);
      });
  }

  destroy(sessionId: string, callback?: (err?: any) => void) {
    Session.findByIdAndDelete(sessionId)
      .then(() => callback && callback())
      .catch((err) => {
        console.error("Session destroy error:", err);
        callback && callback(err);
      });
  }

  touch(
    sessionId: string,
    session: SessionData,
    callback?: (err?: any) => void
  ) {
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);

    Session.findByIdAndUpdate(
      sessionId,
      { expires: expires },
      { new: true, runValidators: true }
    )
      .then(() => callback && callback())
      .catch((err) => {
        console.error("Session touch error:", err);
        callback && callback(err);
      });
  }

  getUserSessions(
    userId: string,
    callback: (err: any, sessions?: any[]) => void
  ) {
    Session.find({ "data.passport.user": userId })
      .then((sessions) => callback(null, sessions))
      .catch((err) => callback(err));
  }

  clearExpiredSessions(callback?: (err?: any) => void) {
    Session.deleteMany({ expires: { $lt: new Date() } })
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }

  getSessionCount(callback: (err: any, count?: number) => void) {
    Session.countDocuments({})
      .then((count) => callback(null, count))
      .catch((err) => callback(err));
  }
}