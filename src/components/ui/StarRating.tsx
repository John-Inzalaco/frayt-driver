import React, { Component } from 'react';
import { Text, View } from 'native-base';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { StyleSheet } from 'react-native';

type Props = {
  rating?: number;
  total?: number;
  style?: any;
  starStyle?: any;
};

export default class StarRating extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  renderVerbalRating(): Element {
    const { rating } = this.props;
    let ratingDescription;

    if (!rating) {
      ratingDescription = 'Unrated';
    } else if (rating >= 5) {
      ratingDescription = 'Perfect';
    } else if (rating >= 4) {
      ratingDescription = 'Great';
    } else if (rating >= 3) {
      ratingDescription = 'Average';
    } else if (rating >= 2) {
      ratingDescription = 'Poor';
    } else {
      ratingDescription = 'Unacceptable';
    }

    return <Text>{ratingDescription}</Text>;
  }

  render() {
    const { rating, starStyle, style } = this.props;
    const total = this.props.total ?? 5;

    if (!rating) {
      return (
        <View style={[style, styles.wrapper]}>
          <Text style={starStyle}>No Ratings</Text>
        </View>
      );
    }

    const solidStars = [...Array(Math.trunc(rating))].map((_, index) => {
      return (
        <FontAwesome5Icon
          style={starStyle}
          name='star'
          solid
          testID={`solid-star`}
          key={`solid-stars-${index}`}
        />
      );
    });
    const solidHalfStar =
      rating % 1 > 0.5 ? (
        <FontAwesome5Icon name='star-half-alt' key={'solid-half-star'} />
      ) : null;
    const emptyStars = [...Array(Math.trunc(total - rating))].map(
      (_, index) => {
        return (
          <FontAwesome5Icon
            style={starStyle}
            name='star'
            key={`empty-stars-${index}`}
          />
        );
      },
    );

    // if we didnt add a half star and it's not a perfect score or a 1
    // then we need to add another empty star
    if (rating % 1 < 0.5 && rating < total && rating > 1) {
      emptyStars.push(
        <FontAwesome5Icon
          style={starStyle}
          name='star'
          key={`empty-stars-extra`}
        />,
      );
    }

    return (
      <View style={[style, styles.wrapper]}>
        {[...solidStars, solidHalfStar, ...emptyStars]}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flex: 1,
  },
});
