import { Context, Elysia, RouteSchema } from 'elysia';
import { safeMethods } from '../../types/method.types';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { readFileSync, rmSync } from 'fs';
import { rm } from 'fs/promises';
import { rename } from 'fs/promises';
import { compressionImage } from '../helpers/image';
import { fileTypeFromBlob } from 'file-type';

type UploadContext = Context<{
  body: Record<string, Blob | Blob[] | unknown | unknown[]>;
}>;

export type UploadPlugin = {
  files: Record<string, PluginFile | PluginFile[]>;
};

export type UploadFiles = Record<string, PluginFile | PluginFile[]>;

export type ContextUpload<T extends RouteSchema = RouteSchema> = Context<T> & {
  upload: UploadPlugin;
};

type Options = {
  publicDir?: string;
};

type BodyBlobFields = Array<[string, Blob | Blob[]]>;

export type PluginFile = {
  filename: string;

  reWriteFile: (
    newFileEntry: Blob,
    newFileName?: string,
  ) => Promise<PluginFile>;

  deleteFile: () => Promise<void>;
  deleteFileSync: VoidFunction;

  readFile: () => Promise<Blob>;
  readFileSync: () => Blob;
};

export default (options?: Options) => {
  const { publicDir = Bun.env.SERVER_PUBLIC! } = options ?? {};

  const inPublicDir = (filename: string) => resolve(publicDir, filename);

  const writeInPublicDir = async (fileName: string, fileBlob: Blob) => {
    const fileType = await fileTypeFromBlob(fileBlob);

    const isImage = fileBlob.type.match('image');

    const fileWitoutExt = fileName.replace(`.${fileType?.ext}`, '');

    if (isImage) {
      const compressionBufer = await compressionImage(fileBlob);

      await compressionBufer.toFile(inPublicDir(`${fileName}.webp`));

      return `${fileWitoutExt}.webp`;
    } else {
      !!fileType &&
        (await Bun.write(
          inPublicDir(`${fileWitoutExt}.${fileType.ext}`),
          fileBlob,
        ));

      return `${fileName.replace(`.${fileType!.ext}`, '')}.${fileType!.ext}`;
    }
  };

  const createPluginFile = async (fileEntry: Blob): Promise<PluginFile> => {
    const generateFilename = randomUUID();

    const generatedFilename = await writeInPublicDir(
      generateFilename,
      fileEntry,
    );

    return {
      filename: generatedFilename,

      deleteFile: async () => await rm(inPublicDir(generatedFilename)),
      deleteFileSync: () => rmSync(inPublicDir(generatedFilename)),

      async reWriteFile(newFileEntry, newFileName) {
        const reWritedFilename = await writeInPublicDir(
          generatedFilename,
          newFileEntry,
        );

        if (!!newFileName) {
          await rename(
            inPublicDir(generatedFilename),
            inPublicDir(newFileName),
          );

          // @ts-ignore
          this.filename = reWritedFilename;
        }

        return this;
      },

      readFile: async () =>
        new Blob([
          await Bun.file(inPublicDir(generatedFilename)).arrayBuffer(),
        ]),
      readFileSync: () => {
        const BufferFromFile = readFileSync(inPublicDir(generatedFilename));

        return new Blob([Buffer.from(BufferFromFile.buffer)]);
      },
    };
  };

  return async (app: Elysia) =>
    app
      .decorate('upload', {
        files: {},
      } as UploadPlugin)
      .onBeforeHandle<UploadContext>(async ({ body, request, upload }) => {
        if (safeMethods.includes(request.method)) return;
        if (
          !request.headers
            .get('content-type')!
            .split(';')
            .includes('multipart/form-data')
        )
          return;

        const bodyFields = Object.entries(body);

        // Тело запроса пусто
        if (bodyFields.length === 0) return;

        const bodyFieldWithoutPrimitives = bodyFields.filter(
            ([field, fieldValue]) => {
              return !['boolean', 'number', 'string'].includes(
                typeof fieldValue,
              );
            },
          ),
          onlyBlobFields: BodyBlobFields = bodyFieldWithoutPrimitives
            .map(([field, fieldValue]) => {
              if (Array.isArray(fieldValue)) {
                return [
                  field,
                  fieldValue.filter(
                    nestedFieldValue => nestedFieldValue instanceof Blob,
                  ),
                ] as [string, Blob[]];
              }
              if (fieldValue instanceof Blob)
                return [field, fieldValue] as [string, Blob];
            })
            .filter(field => !!field);

        const files: Record<string, PluginFile | Array<PluginFile>> = {};

        for await (const [field, blobFieldValue] of onlyBlobFields) {
          if (Array.isArray(blobFieldValue)) {
            for await (const nestedBlobValue of blobFieldValue) {
              if (!files[field] || !Array.isArray(files[field]))
                files[field] = [];

              files[field].push(await createPluginFile(nestedBlobValue));
            }
          } else files[field] = await createPluginFile(blobFieldValue);
        }

        upload.files = files;
      });
};
