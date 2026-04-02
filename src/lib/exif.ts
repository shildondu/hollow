import ExifReader from "exifreader";

export interface ExifData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
}

export async function parseExif(file: File): Promise<ExifData> {
  try {
    const buffer = await file.arrayBuffer();
    const tags = ExifReader.load(buffer);

    const exifData: ExifData = {};

    // Camera
    if (tags["Model"]?.description) {
      const make = tags["Make"]?.description || "";
      const model = tags["Model"].description;
      exifData.camera = make ? `${make} ${model}` : model;
    }

    // Lens
    if (tags["LensModel"]?.description) {
      exifData.lens = tags["LensModel"].description;
    }

    // Aperture
    if (tags["FNumber"]?.description) {
      exifData.aperture = tags["FNumber"].description;
    }

    // Shutter speed
    if (tags["ExposureTime"]?.description) {
      exifData.shutter = tags["ExposureTime"].description;
    }

    // ISO
    if (tags["ISOSpeedRatings"]?.description) {
      exifData.iso = tags["ISOSpeedRatings"].description;
    }

    return exifData;
  } catch (error) {
    console.error("EXIF parse error:", error);
    return {};
  }
}
