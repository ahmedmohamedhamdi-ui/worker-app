import React from "react";
import "./housingdatat.css";

export const Housingdata = () => {
  return (
    <div style={{ color: "red", margin: "auto", width: "10%" }}>
      Housingdata
      <div>
        <table>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>age</th>
          </tr>
          <tr>
            <td>1</td>
            <td>ali</td>
            <td>25</td>
          </tr>
          <tr>
            <td>2</td>
            <td>ahmed</td>
            <td>30</td>
          </tr>
          <tr>
            <td>3</td>
            <td>sayed</td>
            <td>30</td>
          </tr>
          <tr>
            <td>4 </td>
            <td>hamdi</td>
            <td>30</td>
          </tr>
        </table>
      </div>
    </div>
  );
};
