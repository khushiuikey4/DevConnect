import LandingExplore from "./LandingExplore";
import LandingFooter from "./LandingFooter";
import LandingHero from "./LandingHero";
import LandingPageHeader from "./landingPageHeader";
import LandingWork from "./LandingWork";

export default function LandingPage() {
    return <>
        <LandingPageHeader></LandingPageHeader>
        <LandingHero></LandingHero>
        <LandingExplore></LandingExplore>
        <LandingWork></LandingWork>
        <LandingFooter></LandingFooter>
    </>
}