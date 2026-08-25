import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { WorkIndex } from "@/components/work-index";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WorkIndex />
        <About />
        <Contact />
      </main>
    </>
  );
}
