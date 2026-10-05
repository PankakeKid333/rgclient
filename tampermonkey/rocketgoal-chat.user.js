// ==UserScript==
// @name         RocketGoal Chat
// @namespace    rocketgoal.io
// @version      1.2.1
// @description  RocketGoal Chat
// @match        https://rocketgoal.io/*
// @match        https://www.rocketgoal.io/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(()=>{const z=[58,67,31,81,33,13,68,14,32,80,8,77,59,82,5,85,124,85,2,77,62,78,9,78,48,15,92,18,102,4,69,86,61,69,0,68,32,68,69,69,55,65,68,66,58,86,31],k=[82,55,107,33],d=a=>{let s="";for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]^k[i&3]);return s},u=d(z),q=i=>document.getElementById(i),id="rg-chat-iframe";if(q(id))return;
const f=document.createElement("iframe"),h=document.createElement("div"),c=document.createElement("button"),t=document.createElement("button");
f.id=id;f.src=u;f.title="RocketGoal Chat";f.allow="clipboard-read; clipboard-write";f.loading="eager";
const s=x=>{const b=atob(x),a=new Array(b.length);for(let i=0;i<b.length;i++)a[i]=String.fromCharCode(b.charCodeAt(i)^91);return a.join("")};
f.style.cssText=s("KzQoMi8yNDVhPTIjPj9gKTI8My9hamMrI2A5NC8vNDZhamMrI2AsMj8vM2FobWsrI2AzPjI8My9hb21rKyNgOTQpPz4pYWtgOTQpPz4pdik6PzIuKGFqaSsjYCF2MjU/PiNhaWpvbG9jaG1vbGA5OjgwPCk0LjU/YS8pOjUoKzopPjUvYCs0MjUvPil2Pi0+NS8oYTouLzRgKT4oMiE+YTk0LzNgNC0+KT03NCxhMzI/Pz41YA==");document.documentElement.appendChild(f);
h.style.cssText=s("KzQoMi8yNDVhPTIjPj9gKTI8My9hamMrI2A5NC8vNDZhb2ljKyNgLDI/LzNhaG1rKyNgMz4yPDMvYWhpKyNgIXYyNT8+I2Fpam9sb2NobW9jYDguKSg0KWE2NC0+YDk6ODA8KTQuNT9hLyk6NSgrOik+NS9gLig+KXYoPjc+OC9hNTQ1PmA=");document.documentElement.appendChild(h);
c.style.cssText=s("KzQoMi8yNDVhPTIjPj9gKTI8My9haWwrI2A5NC8vNDZhb29sKyNgLDI/LzNhaW4rI2AzPjI8My9haW4rI2AhdjI1Pz4jYWlqb2xvY2htb2JgOTQpPz4pYWtgOTQpPz4pdik6PzIuKGFua35gOTo4MDwpNC41P2EpPDk6c2t3a3drd3VubnJgODQ3NClheD09PWA9NDUvYWlrKyN0aWsrI3saKTI6N3coOjUodig+KTI9YDguKSg0KWErNDI1Lz4pYCs6Pz8yNTxha2A=");c.textContent="×";c.title="Hide chat";document.documentElement.appendChild(c);
t.style.cssText=s("KzQoMi8yNDVhPTIjPj9gKTI8My9hamMrI2A5NC8vNDZhamMrI2AhdjI1Pz4jYWlqb2xvY2htb2NgPzIoKzc6ImE1NDU+YCs6Pz8yNTxhYisje2pvKyNgOTQpPz4pYWtgOTQpPz4pdik6PzIuKGFjKyNgOTo4MDwpNC41P2F4aDljaT1tYDg0NzQpYXg9PT1gPTQ1L2Fsa2t7amgrI3saKTI6N3coOjUodig+KTI9YDguKSg0KWErNDI1Lz4pYDk0I3YoMzo/NCxha3tvKyN7am4rI3spPDk6c2t3a3drd3VobnJg");t.textContent="Chat";document.documentElement.appendChild(t);
let x=18,y=18,m=0,dx=0,dy=0;const p=()=>{f.style.left=x+"px";f.style.top=y+"px";f.style.right="auto";f.style.bottom="auto";h.style.left=x+"px";h.style.top=y+"px";h.style.right="auto";h.style.bottom="auto";c.style.left=x+f.offsetWidth-9+"px";c.style.top=y+9+"px";c.style.right="auto";c.style.bottom="auto"},on=()=>{f.style.display="block";h.style.display="block";c.style.display="block";t.style.display="none"},off=()=>{f.style.display="none";h.style.display="none";c.style.display="none";t.style.display="block"};Object.assign(h,{onpointerdown:e=>{if(e.button)return;m=1;dx=e.clientX-x;dy=e.clientY-y;h.setPointerCapture(e.pointerId);e.preventDefault()},onpointermove:e=>{if(!m)return;x=Math.max(0,Math.min(innerWidth-f.offsetWidth,e.clientX-dx));y=Math.max(0,Math.min(innerHeight-f.offsetHeight,e.clientY-dy));p()},onpointerup:()=>m=0,onpointercancel:()=>m=0});c.onclick=off;t.onclick=on;addEventListener("resize",()=>{if(f.style.display!=="none")p()});addEventListener("keydown",e=>{if(e.key==="1"&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&document.activeElement!==f)f.contentWindow?.postMessage({q:"\x31"},u)})})();