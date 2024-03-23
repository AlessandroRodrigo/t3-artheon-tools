import ffmpeg from "fluent-ffmpeg";
import { type ReadStream } from "fs";
import { PassThrough, type Readable } from "stream";

const AUDIO_CODEC = "libmp3lame";

export const extractAudioStream = (fileStream: Readable, format = "mp3") => {
  const stream = new PassThrough();

  ffmpeg(fileStream)
    .audioCodec(AUDIO_CODEC)
    .toFormat(format)
    .on("error", (err) => {
      console.log(`Error processing audio: ${err}`);
      stream.emit("error", err);
    })
    .on("end", () => {
      console.log(`Audio extracted`);
      stream.end();
    })
    .pipe(stream);

  return stream;
};

export const batchExtractAudio = async (fileStreams: ReadStream[]) => {
  try {
    const tasks = fileStreams.map((stream) => {
      return extractAudioStream(stream);
    });

    // const maxConcurrency = cpus().length;

    // async.parallelLimit(tasks, maxConcurrency, (err) => {
    //   if (err) {
    //     console.error("Um erro ocorreu durante a execução das tarefas", err);
    //   } else {
    //     console.log("Todas as tarefas foram concluídas com sucesso.");
    //   }
    // });

    return tasks;
  } catch (err) {
    console.error("Erro ao processar o diretório de entrada:", err);
  }
};
