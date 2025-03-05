import { resolve } from 'path';
import sharp from 'sharp';
import { PluginFile } from '../plugins/upload';

export const comperessionLogo = async (
  path: string,
  base: string = Bun.env.SERVER_PUBLIC!,
) => {
  const fileLogo = Bun.file(resolve(base, path));

  // console.log({
  //     fileLogo: await fileLogo.arrayBuffer(),
  //     path: resolve(base, path)
  // });
};

export const compressionLogoFile = async (logoFile: PluginFile) => {
  const sharpBuffer = await sharp(
    await (await logoFile.readFile()).arrayBuffer(),
  )
    .keepExif()
    .resize({
      width: 150,
      height: 40,
    })
    .toBuffer();

  return await logoFile.reWriteFile(new Blob([sharpBuffer]));
};

export const compressionImage = async (fileEntry: Blob) => {
  const sharpFile = sharp(await fileEntry.arrayBuffer()).keepExif();

  return sharpFile.webp();
};
