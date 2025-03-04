import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import sharp from "sharp";

export const comperessionLogo = async (path: string, base: string = Bun.env.SERVER_PUBLIC!) => {
    const fileLogo = Bun.file(resolve(base, path));

    // console.log({ 
    //     fileLogo: await fileLogo.arrayBuffer(), 
    //     path: resolve(base, path) 
    // });
};