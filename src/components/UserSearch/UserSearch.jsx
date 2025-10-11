import { useState } from "react";
// import { useQuery, gql } from "@apollo/client";
import { TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";
import useDebounce from "../../hooks/useDebounce";

const STATIC_USERS = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

const DEBOUNCE_MS = 250;

function UserSearch({ onChange, TextFieldProps = {} }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // Filter static users by search
  const users = STATIC_USERS.filter(u =>
    u.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  function handleInputChange(event, value, reason) {
    if (reason === "input") {
      setSearch(value);
    }
  }

  function handleChange(event, user, reason) {
    if (reason === "selectOption") {
      onChange(user);
    }
  }

  return (
    <Autocomplete
      clearOnBlur
      blurOnSelect
      options={users}
  getOptionLabel={(user) => user.name}
      onInputChange={handleInputChange}
      value={null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} {...TextFieldProps} />}
    />
  );
}

export default UserSearch;
