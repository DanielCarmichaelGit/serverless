import { z } from "zod";

const yesNoBool = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase().includes("yes")) {
        return true;
    }
    if (val.toLowerCase().includes("no")) {
        return false;
    }
    return null;
  }
  return val;
}, z.boolean());

const formatKey = (key) => {
    return key.toLowerCase().replace("-", "_");
}


const transform = {
    toBool: yesNoBool,
    formatKey,
}

export { transform };