import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);

CustomEase.create("curtain", "0.83, 0, 0.17, 1");
CustomEase.create("expoOut", "0.16, 1, 0.3, 1");

export { gsap, ScrollTrigger, Flip };
