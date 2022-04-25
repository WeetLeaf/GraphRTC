import { FileUpload } from "graphql-upload";
import { HttpContext, HttpContextWithUser } from "./context";

export type ShemaBuilderOptions = {
  Context: HttpContext;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
    CursorID: {
      Input: string;
      Output: string;
    };
    Upload: {
      Input: Promise<FileUpload>;
      Output: FileUpload;
    };
  };
  AuthScopes: {
    isAuthenticated: boolean;
  };
  AuthContexts: {
    isAuthenticated: HttpContextWithUser;
  };
  DefaultInputFieldRequiredness: true;
};
