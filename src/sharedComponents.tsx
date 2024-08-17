import { buffer_t } from "./lib/FIFOBuffer";
import './sharedContainers.css'

export function ReaderBox(props: {
  id: string;
  title: string;
  valueList: buffer_t | null;
}){
  return(
    <div className='readerBox' id={props.id}>
      <h2 className="readerHeader">
        {props.title}
      </h2>
      <div className="readerValues" id={props.valueList === null ? "not-connected" : "connected"}>
        {props.valueList?.forEach(v => <div>{v}</div>) ?? <h2>Not Connected</h2>}
      </div>
    </div>
  )
}