import React from "react";

export default function LanguageSelector({ language, onLanguageChange }) {
  return (
    <div className="mb-6">
      <label
        htmlFor="language-select"
        className="block text-lg font-medium text-gray-700 mb-2"
      >
        Select Language
      </label>
      <select
      id="language-select"
      value={language}
      onChange={(e) => handleLanguageChange(e.target.value)}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="csharp">C#</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="cpp">C++</option>
      <option value="go">Go</option>
      <option value="ruby">Ruby</option>
      <option value="php">PHP</option>
      <option value="json">JSON</option>
      <option value="sql">SQL</option>
      <option value="xml">XML</option>
      <option value="yaml">YAML</option>
      <option value="markdown">Markdown</option>
      <option value="objective-c">Objective-C</option>
      <option value="swift">Swift</option>
      <option value="rust">Rust</option>
      <option value="kotlin">Kotlin</option>
      <option value="scala">Scala</option>
      <option value="lua">Lua</option>
      <option value="perl">Perl</option>
      <option value="bash">Bash</option>
      <option value="powershell">PowerShell</option>
      <option value="dockerfile">Dockerfile</option>
      <option value="graphql">GraphQL</option>
    </select>
    </div>
  );
}
