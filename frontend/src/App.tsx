import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import About from "./pages/About";
import ComingSoon from "./pages/ComingSoon";
import Contact from "./pages/Contact";
import Enrollment from "./pages/Enrollment";
import Events from "./pages/Events";
import Facilities from "./pages/Facilities";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Staff from "./pages/Staff";

// Login and the user panels come in the next step; unknown addresses show "ComingSoon".
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="staff" element={<Staff />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="news" element={<News />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="enrollment" element={<Enrollment />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
