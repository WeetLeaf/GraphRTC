import { FileUpload } from 'graphql-upload';
import { HttpContext, HttpContextWithUser } from './context';

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
    isAdmin: boolean;
    isPatient: boolean;
    isPhysio: boolean;
  };
  AuthContexts: {
    isAuthenticated: HttpContextWithUser;
    isAdmin: HttpContextWithUser;
    isPatient: HttpContextWithUser;
    isPhysio: HttpContextWithUser;
  };
  DefaultInputFieldRequiredness: true;
};
