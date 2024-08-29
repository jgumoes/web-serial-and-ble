import { buffer_t } from "./lib/FIFOBuffer";
import './sharedContainers.css'

export function ReaderBox(props: {
  id: string;
  title: string;
  valueList: buffer_t | null;
  connected: boolean;
}){
  return(
    <div className='readerBox' id={props.id}>
      <h2 className="readerHeader">
        {props.title}
      </h2>
      <div className="readerValues" id={props.connected ? "connected" : "not-connected"}>
        {props.connected ? props.valueList?.map(v => <div key={v?.id}>key: {v?.id}; value:{v?.value}</div>) : <h2>Not Connected</h2>}
      </div>
    </div>
  )
}