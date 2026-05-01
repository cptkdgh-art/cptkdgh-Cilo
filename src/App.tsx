/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from "react-router";
import { StoreProvider } from "./store";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ChatView from "./pages/ChatView";
import SettingsView from "./pages/SettingsView";
import CharacterEditView from "./pages/CharacterEditView";
import ChatHistoryView from "./pages/ChatHistoryView";
import CharacterManagementView from "./pages/CharacterManagementView";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chat/:sessionId" element={<ChatView />} />
            <Route path="chats" element={<ChatHistoryView />} />
            <Route path="characters" element={<CharacterManagementView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="character/new" element={<CharacterEditView />} />
            <Route path="character/edit/:characterId" element={<CharacterEditView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

