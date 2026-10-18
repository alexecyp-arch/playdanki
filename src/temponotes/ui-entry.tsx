import React from 'react';
import {createRoot} from 'react-dom/client';
import Notes from './notes';
export function mount(element:HTMLElement,request:typeof fetch){
  const root=createRoot(element);
  root.render(<Notes request={request}/>);
  return ()=>root.unmount();
}
