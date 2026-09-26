const palette = (h, c) => ({
  50:`oklch(98% ${Math.max(c*.10,.004).toFixed(3)} ${h})`,100:`oklch(95% ${(c*.18).toFixed(3)} ${h})`,200:`oklch(90% ${(c*.32).toFixed(3)} ${h})`,300:`oklch(83% ${(c*.50).toFixed(3)} ${h})`,400:`oklch(72% ${(c*.72).toFixed(3)} ${h})`,500:`oklch(62% ${c.toFixed(3)} ${h})`,600:`oklch(53% ${(c*.96).toFixed(3)} ${h})`,700:`oklch(45% ${(c*.82).toFixed(3)} ${h})`,800:`oklch(37% ${(c*.62).toFixed(3)} ${h})`,900:`oklch(29% ${(c*.44).toFixed(3)} ${h})`,950:`oklch(20% ${(c*.28).toFixed(3)} ${h})`
});
const neutral = (h,c=.014) => ({50:`oklch(98% .003 ${h})`,100:`oklch(95% .004 ${h})`,200:`oklch(90% .006 ${h})`,300:`oklch(83% .008 ${h})`,400:`oklch(72% .010 ${h})`,500:`oklch(60% .012 ${h})`,600:`oklch(49% ${c} ${h})`,700:`oklch(39% ${c} ${h})`,800:`oklch(29% .012 ${h})`,900:`oklch(21% .010 ${h})`,950:`oklch(14% .008 ${h})`});
export const tokens = {
 color:{palette:{slate:neutral(260,.018),gray:neutral(260,.010),indigo:palette(270,.20),blue:palette(250,.18),cyan:palette(205,.15),teal:palette(180,.14),emerald:palette(155,.16),lime:palette(125,.16),amber:palette(80,.16),orange:palette(55,.18),red:palette(25,.21),rose:palette(10,.20),pink:palette(345,.20),purple:palette(305,.18),violet:palette(285,.20)}},
 spacing:{0:'0', '0-5':'.125rem',1:'.25rem','1-5':'.375rem',2:'.5rem','2-5':'.625rem',3:'.75rem',4:'1rem',5:'1.25rem',6:'1.5rem',8:'2rem',10:'2.5rem',12:'3rem',16:'4rem',20:'5rem',24:'6rem',32:'8rem'},
 fluidSpacing:{sm:'clamp(1rem, 2cqi, 1.5rem)',md:'clamp(1.5rem, 4cqi, 3rem)',lg:'clamp(2rem, 6cqi, 5rem)',xl:'clamp(3rem, 8cqi, 8rem)'},
 radius:{none:'0',xs:'.125rem',sm:'.25rem',md:'.5rem',lg:'.75rem',xl:'1rem','2xl':'1.5rem','3xl':'2rem',full:'9999px'},
 control:{xs:'1.75rem',sm:'2rem',md:'2.5rem',lg:'3rem',xl:'3.5rem'},
 target:{min:'1.5rem'},
 borderWidth:{0:'0',1:'1px',2:'2px',3:'3px',4:'4px'},
 duration:{instant:'0ms',fast:'120ms',normal:'200ms',slow:'320ms',slower:'500ms'},
 ease:{standard:'cubic-bezier(.2, 0, 0, 1)',enter:'cubic-bezier(0, 0, .2, 1)',exit:'cubic-bezier(.4, 0, 1, 1)',bounce:'cubic-bezier(.2, .8, .2, 1.15)'},
 fontWeight:{thin:100,extralight:200,light:300,normal:400,medium:500,semibold:600,bold:700,extrabold:800,black:900},
 fontSize:{xs:'.75rem',sm:'.875rem',md:'1rem',lg:'1.125rem',xl:'1.25rem','2xl':'clamp(1.5rem, 1.35rem + .75cqi, 1.875rem)','3xl':'clamp(1.875rem, 1.6rem + 1.2cqi, 2.5rem)','4xl':'clamp(2.25rem, 1.8rem + 2cqi, 3.5rem)','5xl':'clamp(3rem, 2.4rem + 3cqi, 4.75rem)'},
 lineHeight:{tight:'1.2',snug:'1.35',normal:'1.5',relaxed:'1.65'},
 shadow:{none:'none',xs:'0 1px 2px rgb(0 0 0 / .05)',sm:'0 1px 3px rgb(0 0 0 / .10), 0 1px 2px rgb(0 0 0 / .06)',md:'0 4px 10px rgb(0 0 0 / .10)',lg:'0 10px 24px rgb(0 0 0 / .13)',xl:'0 20px 40px rgb(0 0 0 / .16)','2xl':'0 28px 64px rgb(0 0 0 / .20)'}
};
