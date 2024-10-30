/**
 *
 * QRCode for JavaScript by Sangmin David Shim.
 * https://github.com/davidshimjs/qrcodejs
 *
 * Licensed under the MIT license.
 * https://opensource.org/license/mit
 *
 *
 * Modified by @19z.
 * https://github.com/19z/qrcodejs-fixUTF8
 *
 * - Add full UTF-8 encoding support.
 * https://github.com/davidshimjs/qrcodejs/issues/266
 *
 *
 * Modified by @flipeador.
 * https://github.com/flipeador/secure-password-generator
 *
 * - Convert to ES6 module.
 * - Minify most of the code.
 * - Remove unused and obsolete code.
 * - Remove the creation of the img element.
 * - Export a function to draw to a svg or canvas.
 *
 * - Change the toUTF8 function to use TextEncoder.
 *
 * - Fix index out of bounds exception.
 * - https://github.com/davidshimjs/qrcodejs/issues/293
 *
 * - Fix QRRSBlock.RS_BLOCK_TABLE.
 * - https://github.com/davidshimjs/qrcodejs/issues/288
 *
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED.
 * https://www.qrcode.com/en/patent.html
 *
 */

/**
 * The size of each cell in the canvas, in pixels.
 */
export const CELL_SIZE_PX = 12;

// eslint-disable-next-line
function Ɐ(t){return(new TextEncoder).encode(t)}class π{constructor(e){this.χ=t.Ǔ,this.Ƭ=Ɐ(e)}Ǚ(){return this.Ƭ.length}write(t){for(let e=0,o=this.Ƭ.length;e<o;e++)t.Ȗ(this.Ƭ[e],8)}}function θ(t,e){this.Ǭ=t,this.Ʋ=e,this.Ȥ=null,this.count=0,this.Ȓ=null,this.Ȕ=[]}θ.prototype={η:function(t){let e=new π(t);this.Ȕ.push(e),this.Ȓ=null},isDark:function(t,e){if(t<0||this.count<=t||e<0||this.count<=e)throw new Error();return this.Ȥ[t][e]},Ω:function(){this.Ȧ(!1,this.Ǎ())},Ȧ:function(t,e){this.count=4*this.Ǭ+17,this.Ȥ=new Array(this.count);for(let t=0;t<this.count;t++){this.Ȥ[t]=new Array(this.count);for(let e=0;e<this.count;e++)this.Ȥ[t][e]=null}this.Ɠ(0,0),this.Ɠ(this.count-7,0),this.Ɠ(0,this.count-7),this.Ɩ(),this.Ɲ(),this.Ƙ(t,e),this.Ǭ>=7&&this.Ƶ(t),null==this.Ȓ&&(this.Ȓ=θ.Ȑ(this.Ǭ,this.Ʋ,this.Ȕ)),this.ψ(this.Ȓ,e)},Ɠ:function(t,e){for(let o=-1;o<=7;o++)if(!(t+o<=-1||this.count<=t+o))for(let r=-1;r<=7;r++)e+r<=-1||this.count<=e+r||(this.Ȥ[t+o][e+r]=0<=o&&o<=6&&(0==r||6==r)||0<=r&&r<=6&&(0==o||6==o)||2<=o&&o<=4&&2<=r&&r<=4)},Ǎ:function(){let t=0,e=0;for(let o=0;o<8;o++){this.Ȧ(!0,o);let r=a.Ǒ(this);(0==o||t>r)&&(t=r,e=o)}return e},Ɲ:function(){for(let t=8;t<this.count-8;t++)null==this.Ȥ[t][6]&&(this.Ȥ[t][6]=t%2==0);for(let t=8;t<this.count-8;t++)null==this.Ȥ[6][t]&&(this.Ȥ[6][t]=t%2==0)},Ɩ:function(){let t=a.Ǐ(this.Ǭ);for(let e=0;e<t.length;e++)for(let o=0;o<t.length;o++){let r=t[e],l=t[o];if(null==this.Ȥ[r][l])for(let t=-2;t<=2;t++)for(let e=-2;e<=2;e++)this.Ȥ[r+t][l+e]=-2==t||2==t||-2==e||2==e||0==t&&0==e}},Ƶ:function(t){let e=a.Ƒ(this.Ǭ);for(let o=0;o<18;o++){let r=!t&&1==(e>>o&1);this.Ȥ[Math.floor(o/3)][o%3+this.count-8-3]=r}for(let o=0;o<18;o++){let r=!t&&1==(e>>o&1);this.Ȥ[o%3+this.count-8-3][Math.floor(o/3)]=r}},Ƙ:function(t,e){let o=this.Ʋ<<3|e,r=a.Ƈ(o);for(let e=0;e<15;e++){let o=!t&&1==(r>>e&1);e<6?this.Ȥ[e][8]=o:e<8?this.Ȥ[e+1][8]=o:this.Ȥ[this.count-15+e][8]=o}for(let e=0;e<15;e++){let o=!t&&1==(r>>e&1);e<8?this.Ȥ[8][this.count-e-1]=o:e<9?this.Ȥ[8][15-e-1+1]=o:this.Ȥ[8][15-e-1]=o}this.Ȥ[this.count-8][8]=!t},ψ:function(t,e){let o=-1,r=this.count-1,l=7,n=0;for(let i=this.count-1;i>0;i-=2)for(6==i&&i--;;){for(let o=0;o<2;o++)if(null==this.Ȥ[r][i-o]){let s=!1;n<t.length&&(s=1==(t[n]>>>l&1)),a.Ǹ(e,r,i-o)&&(s=!s),this.Ȥ[r][i-o]=s,l--,-1==l&&(n++,l=7)}if(r+=o,r<0||this.count<=r){r-=o,o=-o;break}}}},θ.Ǘ=236,θ.ξ=17,θ.Ȑ=function(t,e,o){let r=Ǟ.Ǩ(t,e),l=new λ;for(let e=0;e<o.length;e++){let r=o[e];l.Ȗ(r.χ,4),l.Ȗ(r.Ǚ(),a.Ɓ(r.χ,t)),r.write(l)}let n=0;for(let t=0;t<r.length;t++)n+=r[t].Ȭ;if(l.length>8*n)throw new Error();for(l.length+4<=8*n&&l.Ȗ(0,4);l.length%8!=0;)l.Ǧ(!1);for(;!(l.length>=8*n||(l.Ȗ(θ.Ǘ,8),l.length>=8*n));)l.Ȗ(θ.ξ,8);return θ.Ȫ(l,r)},θ.Ȫ=function(t,e){let o=0,r=0,l=0,n=new Array(e.length),i=new Array(e.length);for(let s=0;s<e.length;s++){let u=e[s].Ȭ,h=e[s].Ƞ-u;r=Math.max(r,u),l=Math.max(l,h),n[s]=new Array(u);for(let e=0;e<n[s].length;e++)n[s][e]=255&t.Ǥ[e+o];o+=u;let g=a.Ɗ(h),f=new Ǜ(n[s],g.Ǚ()-1).Ȍ(g);i[s]=new Array(g.Ǚ()-1);for(let t=0;t<i[s].length;t++){let e=t+f.Ǚ()-i[s].length;i[s][t]=e>=0?f.get(e):0}}let s=0;for(let t=0;t<e.length;t++)s+=e[t].Ƞ;let u=new Array(s),h=0;for(let t=0;t<r;t++)for(let o=0;o<e.length;o++)t<n[o].length&&(u[h++]=n[o][t]);for(let t=0;t<l;t++)for(let o=0;o<e.length;o++)t<i[o].length&&(u[h++]=i[o][t]);return u};let t={Ȅ:1,Ȃ:2,Ǔ:4,Ȇ:8},e={L:1,M:0,Q:3,H:2},o=0,r=1,l=2,n=3,i=4,s=5,u=6,h=7,a={Ǖ:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],Ȉ:1335,Ǵ:7973,Ǯ:21522,Ƈ:function(t){let e=t<<10;for(;a.Ɛ(e)-a.Ɛ(a.Ȉ)>=0;)e^=a.Ȉ<<a.Ɛ(e)-a.Ɛ(a.Ȉ);return(t<<10|e)^a.Ǯ},Ƒ:function(t){let e=t<<12;for(;a.Ɛ(e)-a.Ɛ(a.Ǵ)>=0;)e^=a.Ǵ<<a.Ɛ(e)-a.Ɛ(a.Ǵ);return t<<12|e},Ɛ:function(t){let e=0;for(;0!=t;)e++,t>>>=1;return e},Ǐ:function(t){return a.Ǖ[t-1]},Ǹ:function(t,e,a){switch(t){case o:return(e+a)%2==0;case r:return e%2==0;case l:return a%3==0;case n:return(e+a)%3==0;case i:return(Math.floor(e/2)+Math.floor(a/3))%2==0;case s:return e*a%2+e*a%3==0;case u:return(e*a%2+e*a%3)%2==0;case h:return(e*a%3+(e+a)%2)%2==0;default:throw new Error()}},Ɗ:function(t){let e=new Ǜ([1],0);for(let o=0;o<t;o++)e=e.Ȁ(new Ǜ([1,g.Ȋ(o)],0));return e},Ɓ:function(e,o){if(1<=o&&o<10)switch(e){case t.Ȅ:return 10;case t.Ȃ:return 9;case t.Ǔ:case t.Ȇ:return 8;default:throw new Error()}else if(o<27)switch(e){case t.Ȅ:return 12;case t.Ȃ:return 11;case t.Ǔ:return 16;case t.Ȇ:return 10;default:throw new Error()}else{if(!(o<41))throw new Error();switch(e){case t.Ȅ:return 14;case t.Ȃ:return 13;case t.Ǔ:return 16;case t.Ȇ:return 12;default:throw new Error()}}},Ǒ:function(t){let e=t.count,o=0;for(let r=0;r<e;r++)for(let l=0;l<e;l++){let n=0,i=t.isDark(r,l);for(let o=-1;o<=1;o++)if(!(r+o<0||e<=r+o))for(let s=-1;s<=1;s++)l+s<0||e<=l+s||0==o&&0==s||i==t.isDark(r+o,l+s)&&n++;n>5&&(o+=3+n-5)}for(let r=0;r<e-1;r++)for(let l=0;l<e-1;l++){let e=0;t.isDark(r,l)&&e++,t.isDark(r+1,l)&&e++,t.isDark(r,l+1)&&e++,t.isDark(r+1,l+1)&&e++,0!=e&&4!=e||(o+=3)}for(let r=0;r<e;r++)for(let l=0;l<e-6;l++)t.isDark(r,l)&&!t.isDark(r,l+1)&&t.isDark(r,l+2)&&t.isDark(r,l+3)&&t.isDark(r,l+4)&&!t.isDark(r,l+5)&&t.isDark(r,l+6)&&(o+=40);for(let r=0;r<e;r++)for(let l=0;l<e-6;l++)t.isDark(l,r)&&!t.isDark(l+1,r)&&t.isDark(l+2,r)&&t.isDark(l+3,r)&&t.isDark(l+4,r)&&!t.isDark(l+5,r)&&t.isDark(l+6,r)&&(o+=40);let r=0;for(let o=0;o<e;o++)for(let l=0;l<e;l++)t.isDark(l,o)&&r++;return o+=10*(Math.abs(100*r/e/e-50)/5),o}},g={Ș:function(t){if(t<1)throw new Error();return g.Ȟ[t]},Ȋ:function(t){for(;t<0;)t+=255;for(;t>=256;)t-=255;return g.Ț[t]},Ț:new Array(256),Ȟ:new Array(256)};for(let t=0;t<8;t++)g.Ț[t]=1<<t;for(let t=8;t<256;t++)g.Ț[t]=g.Ț[t-4]^g.Ț[t-5]^g.Ț[t-6]^g.Ț[t-8];for(let t=0;t<255;t++)g.Ȟ[g.Ț[t]]=t;function Ǜ(t,e){if(null==t.length)throw new Error();let o=0;for(;o<t.length&&0==t[o];)o++;this.φ=new Array(t.length-o+e);for(let e=0;e<t.length-o;e++)this.φ[e]=t[e+o]}function Ǟ(t,e){this.Ƞ=t,this.Ȭ=e}Ǜ.prototype={get:function(t){return this.φ[t]},Ǚ:function(){return this.φ.length},Ȁ:function(t){let e=new Array(this.Ǚ()+t.Ǚ()-1);for(let o=0;o<this.Ǚ();o++)for(let r=0;r<t.Ǚ();r++)e[o+r]^=g.Ȋ(g.Ș(this.get(o))+g.Ș(t.get(r)));return new Ǜ(e,0)},Ȍ:function(t){if(this.Ǚ()-t.Ǚ()<0)return this;let e=g.Ș(this.get(0))-g.Ș(t.get(0)),o=new Array(this.Ǚ());for(let t=0;t<this.Ǚ();t++)o[t]=this.get(t);for(let r=0;r<t.Ǚ();r++)o[r]^=g.Ȋ(g.Ș(t.get(r))+e);return new Ǜ(o,0).Ȍ(t)}},Ǟ.Ǫ=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],Ǟ.Ǩ=function(t,e){let o=Ǟ.ñ(t,e);if(null==o)throw new Error();let r=o.length/3,l=[];for(let t=0;t<r;t++){let e=o[3*t+0],r=o[3*t+1],n=o[3*t+2];for(let t=0;t<e;t++)l.push(new Ǟ(r,n))}return l},Ǟ.ñ=function(t,o){switch(o){case e.L:return Ǟ.Ǫ[4*(t-1)+0];case e.M:return Ǟ.Ǫ[4*(t-1)+1];case e.Q:return Ǟ.Ǫ[4*(t-1)+2];case e.H:return Ǟ.Ǫ[4*(t-1)+3];default:return}};class λ{constructor(){this.length=0,this.Ǥ=[]}get(t){let e=Math.floor(t/8);return 1==(this.Ǥ[e]>>>7-t%8&1)}Ȗ(t,e){for(let o=0;o<e;o++)this.Ǧ(1==(t>>>e-o-1&1))}Ǧ(t){let e=Math.floor(this.length/8);this.Ǥ.length<=e&&this.Ǥ.push(0),t&&(this.Ǥ[e]|=128>>>this.length%8),this.length++}}let f=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];function z(t,o){let r=1,l=Ɐ(t).length;for(let t=0;t<f.length;++t){let n=0;switch(o){case e.L:n=f[t][0];break;case e.M:n=f[t][1];break;case e.Q:n=f[t][2];break;case e.H:n=f[t][3]}if(l<=n)break;++r}if(r>f.length)throw new Error();return r}function createModel(µ,δ){let ζ=new θ(z(µ,e[δ]),e[δ]);ζ.η(µ);ζ.Ω();return ζ;}

function addRect(fragment, x, y, color) {
    if (!color || color === 'transparent')
        return;

    const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
    );

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 1);
    rect.setAttribute('height', 1);
    rect.setAttribute('fill', color);

    fragment.appendChild(rect);
}

function drawSVG(svg, model, options) {
    const border = options?.border ? 2 : 0;

    const width = model.count + border;
    const height = model.count + border;

    const fragment = new DocumentFragment();

    if (border) {
        for (let x = 0; x < width; x++)
            addRect(fragment, x, 0, options.border) ||
            addRect(fragment, x, height - 1, options.border);
        for (let y = 0; y < height; y++)
            addRect(fragment, 0, y, options.border) ||
            addRect(fragment, width - 1, y, options.border);
    }

    const n = border ? 1 : 0;
    for (let x = 0; x < model.count; x++)
        for (let y = 0; y < model.count; y++)
            model.isDark(y, x) ?
            addRect(fragment, n+x, n+y, options.color) :
            addRect(fragment, n+x, n+y, options.background);

    svg.replaceChildren(fragment);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    return model.count;
}

function fillRect(ctx, x, y, size, color) {
    if (!color || color === 'transparent')
        return;

    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
}

function drawCanvas(canvas, model, options) {
    const size = options?.size ?? CELL_SIZE_PX;
    const border = options?.border ? 2 * size : 0;

    const ctx = canvas.getContext('2d');

    canvas.width = model.count * size + border;
    canvas.height = model.count * size + border;

    if (border) {
        ctx.lineWidth = border;
        ctx.strokeStyle = options.border;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    const n = border ? 1 : 0;
    for (let x = 0; x < model.count; x++)
        for (let y = 0; y < model.count; y++)
            model.isDark(y, x) ?
            fillRect(ctx, n+x, n+y, size, options.color) :
            fillRect(ctx, n+x, n+y, size, options.background);

    return model.count;
}

/**
 * Draws a QR code into an SVG or canvas element.
 *
 * ### SVG Elements
 * Set CSS `shape-rendering:crispEdges` to disable anti-aliasing. \
 * Preserves contrast and edges, no blurring or color smoothing occurs.
 * @param {SVGElement|HTMLCanvasElement} element
 * The element to draw the QR code into.
 * @param {string} text
 * The text to encode into the QR code.
 * @param {object} [options]
 * @param {'L'|'M'|'Q'|'H'} [options.level]
 * The error correction level to use.
 * @param {string} [options.color]
 * The color or gradient used to paint each cell. \
 * Defaults to `black`. Use `transparent` to not paint.
 * @param {string} [options.background]
 * The color or gradient used to paint the background. \
 * Defaults to `white`. Use `transparent` to not paint.
 * @param {string} [options.border]
 * The color or gradient used to paint the border. \
 * By default, the border is not painted.
 * @param {number} [options.size]
 * The size of each cell in the canvas, in pixels. \
 * This parameter determines the size of the canvas element.
 * @returns {number}
 * @see https://developer.mozilla.org/docs/Web/SVG/Attribute/fill
 * @see https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/fillStyle
 */
export function draw(element, text, options={}) {
    options.level ??= 'L';
    options.color ??= 'black';
    options.background ??= 'white';

    const model = createModel(text, options.level);

    if (element instanceof SVGElement)
        return drawSVG(element, model, options);
    if (element instanceof HTMLCanvasElement)
        return drawCanvas(element, model, options);

    throw new Error('Invalid element');
}
