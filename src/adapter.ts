import * as fs from 'fs';

export interface RecordHandler<T>{
  addRecord(record: T): void;
}

export function load<T>(
  fileName: string,
  recordHandler: RecordHandler<T>
){
  const data: T[] = JSON.parse(fs.readFileSync(fileName).toString());
  data.forEach(record => recordHandler.addRecord(record))
}
