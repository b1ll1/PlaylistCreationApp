import React from "react";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function UserProfile(props) {
  
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  const handleSubmit = () => {
    localStorage.removeItem("access-token");
  }

  return  <Menu as="div" className="relative inline-block text-left">
  <div>
    <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-xl p-3 text-sm font-semibold text-white hover:bg-neutral-800">
      {props.username}
      <ChevronDownIcon
        className="-mr-1 h-5 w-5 text-white"
        aria-hidden="true"
      />
    </Menu.Button>
  </div>

  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <Menu.Items className="absolute right-0 z-10 w-36 origin-top-right rounded-xl bg-white shadow-lg focus:outline-none">
      <div className="py-1">
        <form onSubmit={handleSubmit} >
          <Menu.Item>
            {({ active }) => (
              <button
                type="submit"
                className={classNames(
                  active ? "bg-neutral-200 text-neutral-900" : "text-neutral-700",
                  "block w-full px-4 py-2 text-left text-sm"
                )}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </form>
      </div>
    </Menu.Items>
  </Transition>
</Menu>
}

export default UserProfile;
