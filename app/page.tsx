import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { ArsenicFeature } from "@/components/arsenic-feature";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <div className="px-8 md:px-16 lg:px-24">
          <ArsenicFeature />
        </div>
        <About />
        <Contact />
      </main>
    </>
  );
}
