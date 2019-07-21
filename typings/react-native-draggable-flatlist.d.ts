declare module 'react-native-draggable-flatlist' {
  import React from 'react';
  import ReactNative from 'react-native';

  interface DraggableFlatListProps<TItem> {
    data: readonly TItem[];
    horizontal?: boolean;
    renderItem: (args: {
      item: TItem;
      index: number;
      move: () => unknown;
      moveEnd: () => unknown;
      isActive: boolean;
    }) => JSX.Element;
    keyExtractor: (item: TItem, index: number) => string;
    contentContainerStyle?: ReactNative.StyleProp<ReactNative.ViewStyle>;
    scrollPercent?: number;
    onMoveEnd?: (args: { data: TItem[]; to: any; from: any; row: any }) => void;
  }

  class DraggableFlatList<TItem> extends React.Component<DraggableFlatListProps<TItem>> {}
  export = DraggableFlatList;
}
