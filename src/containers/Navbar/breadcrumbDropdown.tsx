import React, { useState } from "react";
import styled from "styled-components";
import { Dropdown } from "src/@aragon/ods-old";
import { Button, IconType } from "@aragon/ods";

import NavLink from "src/components/NavLink";
import { NAV_LINKS_DATA } from "src/utils/constants";

export const NavlinksDropdown: React.FC = () => {
  const [showCrumbMenu, setShowCrumbMenu] = useState(false);

  return (
    <StyledDropdown
      open={showCrumbMenu}
      onOpenChange={setShowCrumbMenu}
      align="start"
      trigger={
        <Button
          variant="tertiary"
          size="lg"
          iconLeft={showCrumbMenu ? IconType.CLOSE : IconType.MENU}
        />
      }
      sideOffset={8}
      listItems={NAV_LINKS_DATA.map((d) => ({
        component: <NavLink caller="dropdown" data={d} />,
        callback: () => {},
      }))}
    />
  );
};

const StyledDropdown = styled(Dropdown).attrs({
  className: "p-3 w-60 rounded-xl",
})``;
