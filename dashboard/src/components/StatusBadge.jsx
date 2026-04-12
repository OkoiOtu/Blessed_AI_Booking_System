'use client';

const STYLES = {
  confirmed:  { bg:'var(--accent-bg)',  color:'var(--accent)',  label:'Confirmed'  },
  on_trip:    { bg:'var(--blue-bg)',    color:'var(--blue)',    label:'On trip'    },
  completed:  { bg:'var(--green-bg)',   color:'var(--green)',   label:'Completed'  },
  cancelled:  { bg:'var(--red-bg)',     color:'var(--red)',     label:'Cancelled'  },
  new:        { bg:'var(--amber-bg)',   color:'var(--amber)',   label:'New'        },
  reviewed:   { bg:'var(--purple-bg)',  color:'var(--purple)',  label:'Reviewed'   },
  closed:     { bg:'var(--gray-bg)',    color:'var(--gray)',    label:'Closed'     },
  lead:       { bg:'var(--amber-bg)',   color:'var(--amber)',   label:'Lead'       },
  incomplete: { bg:'var(--gray-bg)',    color:'var(--gray)',    label:'Incomplete' },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] ?? { bg:'var(--gray-bg)', color:'var(--gray)', label: status };
  return (
    <span style={{
      display:'inline-block', padding:'2px 10px', borderRadius:20,
      fontSize:12, fontWeight:500, background:s.bg, color:s.color,
      whiteSpace:'nowrap',
    }}>
      {s.label}
    </span>
  );
}
